/** The two brand shapes in opposite corners that show through the glass card. Decorative. */
export function AuthBackdrop() {
  return (
    <>
      <div aria-hidden="true" className="login-blob-start -z-10 bg-accent" />
      <div aria-hidden="true" className="login-blob-end -z-10 bg-brand dark:bg-(--petrol-mid)" />
    </>
  )
}
