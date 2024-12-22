export const metadata = {
  title: 'Bumby API Docs',
  description: 'API documentation for Bumby',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
