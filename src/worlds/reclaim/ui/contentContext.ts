// The content registry reaches components through context so the editor can render the game over
// an overlaid registry. Production never renders a provider: the default is the app singleton.

import { createContext, use } from "react";
import { CONTENT } from "../content";
import type { Content } from "../types";

export const ContentContext = createContext<Content>(CONTENT);

export const useContent = (): Content => use(ContentContext);
