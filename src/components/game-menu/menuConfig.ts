import type { LucideIcon } from "lucide-react";
import {
  Play,
  Settings,
  Search,
  History,
  Sun,
  Moon,
  Monitor,
  Upload,
  Trash2,
  FileJson,
  FileSpreadsheet,
  Database,
  RotateCcw,
  LayoutGrid,
} from "lucide-react";
import type { GameMode, AppView } from "@/types/quiz";
import type { QuizContext } from "@/hooks/useQuiz";
import { MenuPageNavigation } from "./MenuPageNavigation";
import { MenuPageRunActions } from "./MenuPageRunActions";

// ── Page IDs ──
export type MenuPageId =
  | "root"
  | "settings"
  | "navigation"
  | "run-actions"
  | "data";

// ── Action Types ──
export type MenuActionType = "navigate" | "view" | "action" | "toggle";

// ── Runtime Context for Conditions & Dynamic Details ──
export interface MenuContext {
  isQuizActive: boolean;
  gameMode: GameMode;
  theme: "light" | "dark" | "system";
  currentView: AppView;
  historyCount: number;
  runStatus?: string; // e.g. "3/20"
}

// ── Menu Item ──
export interface MenuItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  action: MenuActionType;
  target?: MenuPageId | AppView | string;
  detail?: string | ((ctx: MenuContext) => string);
  condition?: (ctx: MenuContext) => boolean;
  destructive?: boolean;
  disabled?: boolean | ((ctx: MenuContext) => boolean);
}

// ── Menu Section ──
export interface MenuSectionConfig {
  title?: string;
  items: MenuItemConfig[];
}

// ── Custom Component Props ──
export interface MenuPageComponentProps {
  quiz: QuizContext;
  onClose: () => void;
  onPop: () => void;
  onPush: (page: MenuPageId) => void;
}

// ── Menu Page ──
export interface MenuPageConfig {
  id: MenuPageId;
  title: string;
  sections?: MenuSectionConfig[];
  customComponent?: React.ComponentType<MenuPageComponentProps>;
}

// ── Helper to build detail strings ──
const modeDetail = (ctx: MenuContext) => {
  switch (ctx.gameMode) {
    case "arcade":
      return "Arcade";
    case "hardcore":
      return "Hardcore";
    case "exam":
      return "Prüfung";
    default:
      return "";
  }
};

// ── Static Menu Configuration ──
export const MENU_PAGES: MenuPageConfig[] = [
  {
    id: "root",
    title: "Menü",
    sections: [
      {
        items: [
          {
            id: "continue-quiz",
            label: "Quiz fortsetzen",
            icon: Play,
            action: "action",
            target: "continue-quiz",
            condition: (ctx) => ctx.isQuizActive && ctx.currentView !== "quiz",
          },
        ],
      },
      {
        title: "Allgemein",
        items: [
          {
            id: "navigation",
            label: "Schnellnavigation",
            icon: LayoutGrid,
            action: "navigate",
            target: "navigation",
            condition: (ctx) => ctx.isQuizActive && ctx.currentView === "quiz",
          },
          {
            id: "history",
            label: "Session-Verlauf",
            icon: History,
            action: "view",
            target: "history",
            detail: (ctx) =>
              ctx.historyCount > 0 ? `${ctx.historyCount}` : "",
          },
          {
            id: "browse",
            label: "Fragenkatalog",
            icon: Search,
            action: "view",
            target: "browse",
            condition: (ctx) => !(ctx.gameMode === "exam" && ctx.isQuizActive),
          },
          {
            id: "settings",
            label: "Einstellungen",
            icon: Settings,
            action: "navigate",
            target: "settings",
            detail: modeDetail,
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Einstellungen",
    sections: [
      // {
      //   title: "Spielmodus",
      //   items: [
      //     {
      //       id: "mode-arcade",
      //       label: "Arcade",
      //       icon: Zap,
      //       action: "toggle",
      //       target: "arcade",
      //       detail: (ctx) => (ctx.gameMode === "arcade" ? "Aktiv" : ""),
      //     },
      //     {
      //       id: "mode-hardcore",
      //       label: "Hardcore",
      //       icon: Shield,
      //       action: "toggle",
      //       target: "hardcore",
      //       detail: (ctx) => (ctx.gameMode === "hardcore" ? "Aktiv" : ""),
      //     },
      //     {
      //       id: "mode-exam",
      //       label: "Prüfungsmodus",
      //       icon: Timer,
      //       action: "toggle",
      //       target: "exam",
      //       detail: (ctx) => (ctx.gameMode === "exam" ? "Aktiv" : ""),
      //     },
      //   ],
      // },
      {
        title: "Erscheinungsbild",
        items: [
          {
            id: "theme-light",
            label: "Hell",
            icon: Sun,
            action: "toggle",
            target: "light",
            detail: (ctx) => (ctx.theme === "light" ? "Aktiv" : ""),
          },
          {
            id: "theme-dark",
            label: "Dunkel",
            icon: Moon,
            action: "toggle",
            target: "dark",
            detail: (ctx) => (ctx.theme === "dark" ? "Aktiv" : ""),
          },
          {
            id: "theme-system",
            label: "System",
            icon: Monitor,
            action: "toggle",
            target: "system",
            detail: (ctx) => (ctx.theme === "system" ? "Aktiv" : ""),
          },
        ],
      },
      {
        title: "Daten",
        items: [
          {
            id: "backup",
            label: "Backup & Daten",
            icon: Database,
            action: "navigate",
            target: "data",
          },
        ],
      },
    ],
  },
  {
    id: "run-actions",
    title: "Pause",
    customComponent: MenuPageRunActions,
  },
  {
    id: "navigation",
    title: "Schnellnavigation",
    customComponent: MenuPageNavigation,
  },
  {
    id: "data",
    title: "Backup & Daten",
    sections: [
      {
        title: "Export",
        items: [
          {
            id: "export-json",
            label: "Als JSON exportieren",
            icon: FileJson,
            action: "action",
            target: "export-json",
          },
          {
            id: "export-csv",
            label: "Als CSV exportieren",
            icon: FileSpreadsheet,
            action: "action",
            target: "export-csv",
          },
          {
            id: "export-full",
            label: "Vollständiges Backup",
            icon: Database,
            action: "action",
            target: "export-full",
          },
        ],
      },
      {
        title: "Import",
        items: [
          {
            id: "import-progress",
            label: "Fortschritt importieren",
            icon: Upload,
            action: "action",
            target: "import-progress",
          },
          {
            id: "import-full",
            label: "Vollständige Wiederherstellung",
            icon: RotateCcw,
            action: "action",
            target: "import-full",
          },
        ],
      },
      {
        title: "",
        items: [
          {
            id: "delete-all",
            label: "Alle Daten löschen",
            icon: Trash2,
            action: "action",
            target: "delete-all",
            destructive: true,
          },
        ],
      },
    ],
  },
];
