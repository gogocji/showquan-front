// eslint-disable-next-line no-unused-vars
import * as marked from "marked";

declare module "marked" {
  import { marked } from "marked";
  export default marked;
}