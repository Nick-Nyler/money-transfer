import "../app/globals.css"

export const metadata = {
  title: "Money Transfer App",
  description: "A secure and efficient money transfer application",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}