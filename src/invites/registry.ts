import type { TemplateId } from "@/data/templates";
import { agni } from "./agni";
import { bagh, gopuram, haveli, khat, mahal } from "./illustrated-themes";
import { gulmohar } from "./gulmohar";
import { kolam } from "./kolam";
import { mandir } from "./mandir";
import { noor } from "./noor";
import { phulkari } from "./phulkari";
import { rajwada } from "./rajwada";
import type { InviteTheme } from "./types";

export const themes: Record<TemplateId, InviteTheme> = { mandir, mahal, khat, gopuram, bagh, rajwada, gulmohar, agni, noor, phulkari, kolam, haveli };
