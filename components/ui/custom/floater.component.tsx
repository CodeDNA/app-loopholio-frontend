interface FloaterProps {
  children?: Readonly<React.ReactNode>;
}

export function Floater({ children }: FloaterProps) {
  return (
    children && (
      <div className="z-50 flex items-center justify-center wrap-anywhere fixed top-20 right-10 rounded-full space-x-2">
        {children}
      </div>
    )
  );
}
