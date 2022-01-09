import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window: any = new JSDOM("").window;
const DOMpurify = createDOMPurify(window);

export default DOMpurify;
