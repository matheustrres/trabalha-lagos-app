const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/10 via-white to-surface px-4 py-10">
    <div className="w-full max-w-md">{children}</div>
  </div>
);

export default AuthLayout;
