import "./globals.css";
import Chatbot from "@/src/components/chatbot/Chatbot";

export const metadata = {
  title: "SmartAssist Chatbot",
  description: "Reusable decision tree chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
