import type { TemplateId } from "@/data/templates";
import { agni } from "./agni";
import { bagh, gopuram, haveli, khat, khatred, mahal } from "./illustrated-themes";
import { gaurishankar } from "./gaurishankar";
import { gulmohar } from "./gulmohar";
import { kolam } from "./kolam";
import { mandir } from "./mandir";
import { noor } from "./noor";
import { phulkari } from "./phulkari";
import { rajwada } from "./rajwada";
import { sarovar } from "./sarovar";
import type { InviteTheme } from "./types";

export const themes: Record<TemplateId, InviteTheme> = { gaurishankar, mandir, mahal, khat, gopuram, bagh, rajwada, gulmohar, agni, noor, phulkari, kolam, haveli, khatred, sarovar };
