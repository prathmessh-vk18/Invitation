import type { TemplateId } from "@/data/templates";
import { agni } from "./agni";
import { angoothi, bagh, chandni, gopuram, haveli, khat, khatred, mahal, mudrika, rajwadasagai, roka } from "./illustrated-themes";
import { gaurishankar } from "./gaurishankar";
import { gulmohar } from "./gulmohar";
import { kolam } from "./kolam";
import { mandir, vachan } from "./mandir";
import { noor } from "./noor";
import { phulkari } from "./phulkari";
import { rajwada } from "./rajwada";
import { rangmahal } from "./rangmahal";
import { sarovar } from "./sarovar";
import type { InviteTheme } from "./types";

export const themes: Record<TemplateId, InviteTheme> = { gaurishankar, mandir, mahal, khat, gopuram, bagh, rajwada, gulmohar, agni, noor, phulkari, kolam, haveli, khatred, sarovar, vachan, mudrika, angoothi, chandni, roka, rajwadasagai, rangmahal };
