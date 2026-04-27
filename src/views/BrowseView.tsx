import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Image, Star, CheckCircle, XCircle } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';
import type { Frage } from '@/types/quiz';
import { filterFragen } from '@/utils/filter';
import { isMastered } from '@/utils/srs';

interface Props { quiz: QuizContext; }

export default function BrowseView({ quiz }: Props) {
  const { quizData, favorites, metaProgress, srsMap } = quiz;
  const [query, setQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [hasImage, setHasImage] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [masteryFilter, setMasteryFilter] = useState<'all' | 'mastered' | 'unmastered'>('all');
  const [selectedFrage, setSelectedFrage] = useState<Frage | null>(null);

  const allTopics = useMemo(() => {
    if (!quizData) return [];
    return Array.from(new Set(quizData.fragen.map((f) => f.topic))).sort();
  }, [quizData]);

  const filteredFragen = useMemo(() => {
    if (!quizData) return [];
    return filterFragen(quizData.fragen, {
      query,
      topics: selectedTopics.length > 0 ? selectedTopics : undefined,
      hasImage: hasImage || undefined,
      onlyFavorites: onlyFavorites || undefined,
      masteryFilter: masteryFilter !== 'all' ? masteryFilter : undefined,
    }, { favorites, metaProgress: metaProgress.fragen, srsMap });
  }, [quizData, query, selectedTopics, hasImage, onlyFavorites, masteryFilter, favorites, metaProgress.fragen, srsMap]);

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics((prev) => prev.includes(topic) ? prev.filter((b) => b !== topic) : [...prev, topic]);
  }, []);

  if (!quizData) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500 dark:text-slate-400">Lade Fragenkatalog...</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Fragenkatalog</h1>
          <Badge variant="secondary" className="ml-auto">{filteredFragen.length} / {quizData.fragen.length}</Badge>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <Input type="text" placeholder="Frage suchen..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" aria-label="Frage suchen" />
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Themen</p>
            <div className="flex flex-wrap gap-2">
              {allTopics.map((topic) => (
                <label key={topic} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-colors ${selectedTopics.includes(topic) ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                  <Checkbox checked={selectedTopics.includes(topic)} onCheckedChange={() => toggleTopic(topic)} className="sr-only" aria-label={topic} />
                  <span>{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <Checkbox checked={hasImage} onCheckedChange={(checked) => setHasImage(checked === true)} />
              <Image className="w-3.5 h-3.5" aria-hidden="true" /><span>Mit Bild</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <Checkbox checked={onlyFavorites} onCheckedChange={(checked) => setOnlyFavorites(checked === true)} />
              <Star className="w-3.5 h-3.5" aria-hidden="true" /><span>Favoriten</span>
            </label>
          </div>

          <div className="flex gap-2">
            {(['all', 'mastered', 'unmastered'] as const).map((m) => (
              <Button key={m} variant={masteryFilter === m ? 'default' : 'outline'} size="sm" onClick={() => setMasteryFilter(m)} className="text-xs">
                {m === 'all' && 'Alle'}
                {m === 'mastered' && <><CheckCircle className="w-3 h-3 mr-1" />Gemeistert</>}
                {m === 'unmastered' && <><XCircle className="w-3 h-3 mr-1" />Offen</>}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-2">
            {filteredFragen.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-8">Keine Fragen gefunden.</p>}
            {filteredFragen.map((frage) => (
              <button key={frage.id} onClick={() => setSelectedFrage(frage)} className="w-full text-left p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{frage.frage}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px]">{frage.topic}</Badge>
                      {frage.bild && <Image className="w-3 h-3 text-slate-400" aria-hidden="true" />}
                      {favorites.includes(frage.id) && <Star className="w-3 h-3 text-amber-400 fill-amber-400" aria-hidden="true" />}
                      {metaProgress.fragen[frage.id] && isMastered(metaProgress.fragen[frage.id], srsMap[frage.id]) && <CheckCircle className="w-3 h-3 text-emerald-500" aria-hidden="true" />}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!selectedFrage} onOpenChange={() => setSelectedFrage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-base">Frage #{selectedFrage?.id}</DialogTitle></DialogHeader>
          {selectedFrage && (
            <div className="space-y-4">
              <Badge variant="outline">{selectedFrage.topic}</Badge>
              <p className="text-slate-800 dark:text-slate-100">{selectedFrage.frage}</p>
              <div className="space-y-2">
                {(['A', 'B', 'C'] as const).map((key) => (
                  <div key={key} className={`p-3 rounded-lg text-sm ${selectedFrage.richtige_antwort === key ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                    <span className="font-medium">{key}:</span> {selectedFrage.antworten[key]}
                  </div>
                ))}
              </div>
              {selectedFrage.bild && selectedFrage.bild_url && <img src={selectedFrage.bild_url} alt="Fragenbild" className="w-full rounded-lg" loading="lazy" />}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
