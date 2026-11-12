import { DISCLAIMER } from "../labels.ts";

export function Disclaimer({ text = DISCLAIMER }: { text?: string }) {
  return <p className="disclaimer">{text}</p>;
}
