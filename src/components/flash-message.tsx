type FlashMessageProps = {
  error?: string;
  notice?: string;
  className?: string;
};

export function FlashMessage({ error, notice, className }: FlashMessageProps) {
  if (!error && !notice) {
    return null;
  }

  if (error) {
    return (
      <div
        className={`rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300 ${className ?? ""}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300 ${className ?? ""}`}
    >
      {notice}
    </div>
  );
}
