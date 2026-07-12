import { Memory, Collection } from '../types';

interface ProximityResult {
  memories: Memory[];
  proximityType: 'temporal' | 'gps';
  suggestedName?: string;
}

const TEMPORAL_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

export function detectProximityGroups(memories: Memory[]): ProximityResult[] {
  const results: ProximityResult[] = [];
  const processedIds = new Set<string>();

  // Temporal proximity
  for (let i = 0; i < memories.length; i++) {
    if (processedIds.has(memories[i].id)) continue;

    const group: Memory[] = [memories[i]];
    const baseDate = new Date(memories[i].date).getTime();

    for (let j = i + 1; j < memories.length; j++) {
      if (processedIds.has(memories[j].id)) continue;
      const compareDate = new Date(memories[j].date).getTime();

      if (Math.abs(baseDate - compareDate) < TEMPORAL_THRESHOLD_MS) {
        group.push(memories[j]);
      }
    }

    if (group.length > 1) {
      group.forEach((m) => processedIds.add(m.id));
      results.push({
        memories: group,
        proximityType: 'temporal',
        suggestedName: generateTemporalName(group),
      });
    }
  }

  // GPS proximity (for memories with location)
  const locationMemories = memories.filter((m) => !processedIds.has(m.id) && m.location);
  for (let i = 0; i < locationMemories.length; i++) {
    if (processedIds.has(locationMemories[i].id)) continue;

    const group: Memory[] = [locationMemories[i]];

    for (let j = i + 1; j < locationMemories.length; j++) {
      if (processedIds.has(locationMemories[j].id)) continue;
      // Note: Would need GPS coordinates to properly implement
      // This is a placeholder for GPS-based detection
      group.push(locationMemories[j]);
    }

    if (group.length > 1) {
      group.forEach((m) => processedIds.add(m.id));
      results.push({
        memories: group,
        proximityType: 'gps',
        suggestedName: generateLocationName(group),
      });
    }
  }

  return results;
}

function generateTemporalName(memories: Memory[]): string {
  if (memories.length === 0) return 'Nouvelle collection';

  const dates = memories.map((m) => new Date(m.date));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const startDay = minDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const endDay = maxDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return `${startDay} - ${endDay}`;
}

function generateLocationName(memories: Memory[]): string {
  // Extract common location if available
  if (memories[0]?.location) {
    return memories[0].location;
  }
  return 'Nouvelle collection';
}

export function createCollectionFromProximity(result: ProximityResult): Collection {
  const dates = result.memories.map((m) => new Date(m.date));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString();
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString();

  return {
    id: `collection_${Date.now()}`,
    name: result.suggestedName || 'Nouvelle collection',
    start_date: minDate,
    end_date: maxDate,
    memories: result.memories,
    created_at: new Date().toISOString(),
  };
}
