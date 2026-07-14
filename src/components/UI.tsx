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
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      padding: 16,
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
