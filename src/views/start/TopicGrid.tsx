import { Fragment } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { QuizContext } from "@/hooks/useQuiz";
import type { GameMode, MetaProgression } from "@/types/quiz";
import { isMastered } from "@/utils/srs";
import { canSelectTopic, isTopicLocked } from "@/utils/topicLocks";
import { TOPICS } from "./topics";
import type { TopicDef } from "./topics";

interface TopicStatus {
  icon: string;
  label: string;
  cls: string;
}

function getTopicStatus(
  topicId: string,
  gameMode: GameMode,
  metaProgress: MetaProgression,
  quiz: QuizContext,
  isActive: boolean,
  loadedTopics: string[]
): TopicStatus | null {
  if (gameMode === "exam") return null;
  if (gameMode === "arcade") {
    const stars = metaProgress.arcadeStars?.[topicId];
    if (stars) {
      return {
        icon: "★".repeat(stars) + "☆".repeat(3 - stars),
        label: "",
        cls: "text-amber-500 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
      };
    }
    const fragenIds = Object.entries(quiz.quizMeta?.fragenIndex ?? {})
      .filter(([, b]) => b === topicId)
      .map(([id]) => id);
    const allMastered =
      fragenIds.length > 0 &&
      fragenIds.every((id) =>
        isMastered(metaProgress.fragen[id], quiz.srsMap[id])
      );
    if (allMastered) {
      return {
        icon: "✅",
        label: "Bestanden",
        cls: "text-emerald-600 bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400",
      };
    }
  }
  if (gameMode === "hardcore") {
    const tMeta = metaProgress.topics[topicId];
    if (tMeta) {
      if (tMeta.mastered) {
        return {
          icon: "🏆",
          label: "Gemeistert",
          cls: "text-amber-600 bg-amber-500/20 border-amber-500/30 dark:text-amber-400",
        };
      }
      if (tMeta.passed) {
        return {
          icon: "✅",
          label: "Bestanden",
          cls: "text-emerald-600 bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400",
        };
      }
      if (tMeta.lastAttempt) {
        return {
          icon: "❌",
          label: "Nicht bestanden",
          cls: "text-red-600 bg-red-500/20 border-red-500/30 dark:text-red-400",
        };
      }
    }
  }
  if (isActive && loadedTopics.includes(topicId)) {
    return {
      icon: "🔒",
      label: "AKTIV",
      cls: "text-teal-600 bg-teal-500/20 border-teal-500/30 dark:text-teal-400",
    };
  }
  return null;
}

interface TopicCardProps {
  topic: TopicDef;
  checked: boolean;
  inRun: boolean;
  disabled: boolean;
  locked: boolean;
  status: TopicStatus | null;
  onToggle: () => void;
  onKeyToggle: (e: React.KeyboardEvent) => void;
  questionCount: number;
}

function TopicCard({
  topic,
  checked,
  inRun,
  disabled,
  locked,
  status,
  onToggle,
  onKeyToggle,
  questionCount,
}: TopicCardProps) {
  const Icon = topic.icon;

  const topicItem = (
    <div
      onClick={() => !disabled && onToggle()}
      onKeyDown={(e) => !disabled && onKeyToggle(e)}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${checked ? `${topic.bg} ${topic.border} shadow-md` : "bg-slate-200/50 border-slate-300/30 dark:bg-slate-700/30 dark:border-slate-600/30"} ${inRun ? "ring-1 ring-teal-400/30" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-300/50 dark:hover:bg-slate-700/50"}`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${checked ? `${topic.selectedBg} border-transparent` : "border-slate-500 bg-transparent"}`}
        aria-hidden="true"
      >
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div className={`p-1.5 rounded-md ${topic.bg}`} aria-hidden="true">
        <Icon className={`w-4 h-4 ${topic.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-slate-900 font-medium text-sm truncate dark:text-white">
            {topic.label}
          </p>
          {locked ? (
            <span className="px-1 py-0 rounded text-[9px] flex-shrink-0 border text-slate-600 bg-slate-500/20 border-slate-500/30 dark:text-slate-400">
              🔒 Gesperrt
            </span>
          ) : (
            status && (
              <span
                className={`px-1 py-0 rounded text-[9px] flex-shrink-0 border ${status.cls}`}
              >
                {status.icon} {status.label}
              </span>
            )
          )}
        </div>
        <p className="text-slate-500 text-xs dark:text-slate-400">
          {questionCount} Fragen
        </p>
      </div>
    </div>
  );

  return locked ? (
    <Tooltip>
      <TooltipTrigger asChild>{topicItem}</TooltipTrigger>
      <TooltipContent side="top">
        Fehlversuch. Bestehe ein anderes Thema, um dieses wieder
        freizuschalten.
      </TooltipContent>
    </Tooltip>
  ) : (
    <Fragment key={topic.id}>{topicItem}</Fragment>
  );
}

interface TopicGridProps {
  quiz: QuizContext;
  gameMode: GameMode;
  isActive: boolean;
  loadedTopics: string[];
  metaProgress: MetaProgression;
  effektivAusgewaehlt: string[];
  onToggle: (id: string) => void;
  onKeyToggle: (e: React.KeyboardEvent, id: string) => void;
}

export function TopicGrid({
  quiz,
  gameMode,
  isActive,
  loadedTopics,
  metaProgress,
  effektivAusgewaehlt,
  onToggle,
  onKeyToggle,
}: TopicGridProps) {
  return (
    <div
      className="space-y-1"
      role="group"
      aria-label="Themenauswahl"
    >
      {TOPICS.map((topic) => {
        const inRun = isActive && loadedTopics.includes(topic.id);
        const checked = effektivAusgewaehlt.includes(topic.id);
        const status = getTopicStatus(
          topic.id,
          gameMode,
          metaProgress,
          quiz,
          isActive,
          loadedTopics
        );
        const selectable = quiz.quizMeta
          ? canSelectTopic(
              topic.id,
              gameMode,
              metaProgress,
              isActive,
              loadedTopics
            )
          : true;
        const disabled = !selectable && !checked && !inRun;
        const locked =
          gameMode === "hardcore" &&
          isTopicLocked(topic.id, gameMode, metaProgress);

        return (
          <TopicCard
            key={topic.id}
            topic={topic}
            checked={checked}
            inRun={inRun}
            disabled={disabled}
            locked={locked}
            status={status}
            onToggle={() => onToggle(topic.id)}
            onKeyToggle={(e) => onKeyToggle(e, topic.id)}
            questionCount={quiz.quizMeta?.meta.topics[topic.id] ?? 0}
          />
        );
      })}
    </div>
  );
}
