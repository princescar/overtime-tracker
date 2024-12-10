declare module "#/locales/*.yaml" {
  import type { MessageData } from "@messageformat/runtime/messages";
  const content: MessageData;
  export default content;
}
