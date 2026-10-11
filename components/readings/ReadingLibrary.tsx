'use client';

import { useState, useSyncExternalStore } from 'react';
import { clearReadings, deleteReading, parseReadings, LIBRARY_EVENT, LIBRARY_KEY, saveReading, type ReadingPayload, type SavedReading } from '@/lib/readings/storage';

export function SaveReadingButton({ payload }: { payload: ReadingPayload }) {
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const save = () => {
    try {
      saveReading(payload);
      setSaved(true);
      setMessage('이 브라우저의 내 리딩함에 저장했어요.');
    } catch (error) {
      setMessage(error instanceof Error && !(error instanceof DOMException) ? error.message : '저장 공간을 사용할 수 없어요. 브라우저 설정과 여유 공간을 확인해주세요.');
    }
  };
  return <div className="space-y-2">
    <button type="button" onClick={save} className="px-4 py-3 rounded-2xl border border-rose-300 bg-rose-50 text-rose-800 text-sm font-semibold">{saved ? '리딩함에 저장됨 · 다시 저장' : '내 리딩함에 저장'}</button>
    {message && <p role="status" className="text-xs">{message}</p>}
  </div>;
}

export function ReadingLibrary({ onOpen }: { onOpen: (entry: SavedReading) => void }) {

  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const raw = useSyncExternalStore(subscribeToLibrary, getLibrarySnapshot, () => null);
  let readings: SavedReading[] = [];
  let loadError = '';
  try { readings = parseReadings(raw); }
  catch { loadError = '리딩함을 읽을 수 없어요. 저장 공간이 차단되었거나 저장 데이터가 손상되었을 수 있습니다.'; }
  const remove = (id: string) => {
    try { deleteReading(id); } catch { setError('삭제하지 못했어요. 브라우저 저장 공간 설정을 확인해주세요.'); }
  };
  return <section className="max-w-4xl mx-auto px-4 mb-6">
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="reading-library" className="text-sm px-4 py-2 rounded-xl border border-stone-400/40">내 리딩함 · {readings.length}개 {open ? '▴' : '▾'}</button>
    {open && <div id="reading-library" className="mt-3 rounded-2xl p-4 bg-stone-50 text-stone-800 border border-stone-200 space-y-3">
      <p className="text-xs text-stone-600">저장한 결과는 이 브라우저에만 보관돼요. 브라우저 데이터를 지우면 사라지며 다른 기기와 동기화되지 않습니다.</p>
      {(error || loadError) && <p role="alert" className="text-sm text-rose-700">{error || loadError}</p>}
      {!(error || loadError) && readings.length === 0 && <p className="text-sm">결과 화면에서 마음에 남는 리딩을 저장해주세요.</p>}
      <ul className="space-y-2">
        {readings.map(entry => <li key={entry.id} className="flex gap-3 items-center border border-stone-200 bg-white p-3 rounded-xl">
          <button type="button" onClick={() => { onOpen(entry); setOpen(false); }} className="flex-1 min-w-0 text-left">
            <span className="block text-sm font-medium break-words">{entry.title}</span>
            <span className="block text-xs text-stone-500 mt-1">{entry.kind === 'tarot' ? '타로' : '사주'} · {new Date(entry.createdAt).toLocaleDateString('ko-KR')}</span>
          </button>
          <button type="button" aria-label={`${entry.title} 삭제`} onClick={() => remove(entry.id)} className="text-xs text-rose-700 p-2">삭제</button>
        </li>)}
      </ul>
      {(error || loadError || readings.length > 0) && (confirmClear
        ? <div className="flex gap-3 items-center text-xs"><span>이 브라우저의 저장 결과를 모두 삭제할까요?</span><button type="button" className="text-rose-700" onClick={() => { try { clearReadings(); setConfirmClear(false); setError(''); } catch { setError('저장 공간에 접근할 수 없어 삭제하지 못했어요.'); } }}>모두 삭제</button><button type="button" onClick={() => setConfirmClear(false)}>취소</button></div>
        : <button type="button" onClick={() => setConfirmClear(true)} className="text-xs text-stone-600 underline">리딩함 비우기</button>)}
    </div>}
  </section>;
}

function subscribeToLibrary(onChange: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === LIBRARY_KEY || event.key === null) onChange(); };
  window.addEventListener(LIBRARY_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(LIBRARY_EVENT, onChange); window.removeEventListener('storage', onStorage); };
}

function getLibrarySnapshot(): string | null {
  try { return window.localStorage.getItem(LIBRARY_KEY); }
  catch { return 'unavailable'; }
}
