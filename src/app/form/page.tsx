import FormDemoClient from "./FormDemoClient";

export default function FormDemo() {
  return (
    <FormDemoClient 
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
    />
  );
}
