import React from 'react';
import { T } from '../theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  full,
  style,
  ...rest
}) => {
  const variants = {
    primary: {
      background: disabled ? T.paper2 : T.ink,
      color: disabled ? T.muted : T.paper,
    },
    secondary: {
      background: T.paper2,
      color: T.ink,
    },
    ghost: {
      background: 'transparent',
      color: T.sage,
    },
  };

  const sizes = {
    sm: { padding: '8px 12px', fontSize: 12 },
    md: { padding: '12px 16px', fontSize: 14 },
    lg: { padding: '16px 20px', fontSize: 16 },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        width: full ? '100%' : 'auto',
        borderRadius: T.radius,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: T.font,
        fontWeight: 600,
        transition: 'all 0.2s ease',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, onClick, onContextMenu, style }) => (
  <div
    onClick={onClick}
    onContextMenu={onContextMenu}
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      padding: 18,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      ...style,
    }}
  >
    {children}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.paper,
          width: '100%',
          borderRadius: `${T.radius}px ${T.radius}px 0 0`,
          padding: 20,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {title && <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export const Divider = () => (
  <div style={{ height: 1, background: T.border, margin: '16px 0' }} />
);

export const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      background: '#FFF0EE',
      border: '1px solid #F5C6C0',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12.5,
      color: '#C0392B',
    }}
  >
    {message}
  </div>
);

export const Spinner: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: T.muted, fontSize: 13 }}>
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: `2px solid ${T.border}`,
        borderTopColor: T.sage,
        animation: 'bulle-spin 0.8s linear infinite',
      }}
    />
    {label || 'Chargement...'}
    <style>{'@keyframes bulle-spin { to { transform: rotate(360deg); } }'}</style>
  </div>
);

// Petit message temporaire en bas d'écran (ex: "Instant supprimé · Annuler").
export const Toast: React.FC<{
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  durationMs?: number;
}> = ({ message, actionLabel, onAction, onDismiss, durationMs = 5000 }) => {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 76,
        zIndex: 200,
        background: '#2B2B2B',
        color: '#F5F1EA',
        borderRadius: T.radius - 6,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontFamily: T.font,
        fontSize: 13,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      }}
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          onClick={() => {
            onAction();
            onDismiss();
          }}
          style={{ background: 'none', border: 'none', color: T.sage, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, fontSize: 13 }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface ActionSheetItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export const ActionRow: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }> = ({
  icon,
  label,
  onClick,
  danger,
}) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 8px',
      background: 'none',
      border: 'none',
      borderBottom: `1px solid ${T.border}`,
      cursor: 'pointer',
      fontFamily: T.font,
      fontSize: 14,
      color: danger ? '#C0392B' : T.ink,
      textAlign: 'left',
      width: '100%',
    }}
  >
    {icon}
    {label}
  </button>
);

// Menu d'actions ouvert par appui long ou clic droit sur une entrée
// (Instants, Envies, Prière...). Un seul composant réutilisé partout.
export const ActionSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  items: ActionSheetItem[];
}> = ({ isOpen, onClose, title = 'Actions', items }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((item) => (
        <ActionRow
          key={item.key}
          icon={item.icon}
          label={item.label}
          danger={item.danger}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        />
      ))}
    </div>
  </Modal>
);

// Détecteur d'appui long (tactile + souris) pour ouvrir une ActionSheet
// sur mobile ("appui long") tout en gardant le clic droit sur desktop.
export const LongPressWrapper: React.FC<{ children: React.ReactNode; onLongPress: () => void }> = ({
  children,
  onLongPress,
}) => {
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => {
    timer.current = setTimeout(onLongPress, 550);
  };
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  return (
    <div onTouchStart={start} onTouchEnd={clear} onTouchMove={clear} onMouseDown={start} onMouseUp={clear} onMouseLeave={clear}>
      {children}
    </div>
  );
};
