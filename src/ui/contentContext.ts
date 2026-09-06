// The content registry reaches components through context so the editor can render the game over
// an overlaid registry. Production never renders a provider: the default is the app singleton.

import { createContext, use } from "react";
import { CONTENT } from "../content";
import type { ContentRegistry } from "../engine/types";

export const ContentContext = createContext<ContentRegistry>(CONTENT);

export const useContent = (): ContentRegistry => use(ContentContext);
