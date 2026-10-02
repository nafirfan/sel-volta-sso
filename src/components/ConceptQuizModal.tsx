import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Award, ChevronRight, X } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Pada sel Daniell standar (Zn/Zn²⁺ || Cu²⁺/Cu), peristiwa yang terjadi pada elektroda Zn adalah...',
    options: [
      'Reduksi dan batang Zn bertambah tebal',
      'Oksidasi dan batang Zn menipis/mengikis',
      'Reduksi dan larutan berubah warna menjadi biru',
      'Oksidasi dan batang Zn menarik elektron dari katoda'
    ],
    correctIndex: 1,
    explanation: 'Zn memiliki E° lebih negatif (-0,76 V) dibandingkan Cu (+0,34 V), sehingga Zn mengalami oksidasi (Zn → Zn²⁺ + 2e⁻) dan bertindak sebagai anoda. Akibatnya, atom Zn larut menjadi ion Zn²⁺ dan batang Zn mengikis.'
  },
  {
    id: 2,
    question: 'Arah aliran elektron sesungguhnya pada rangkaian luar sel volta adalah...',
    options: [
      'Dari Katoda (kutub negatif) menuju Anoda (kutub positif)',
      'Dari Anoda (kutub negatif) menuju Katoda (kutub positif)',
      'Dari Jembatan garam menuju ke Voltmeter',
      'Dari Katoda (kutub positif) menuju Anoda (kutub negatif)'
    ],
    correctIndex: 1,
    explanation: 'Pada sel volta, oksidasi melepaskan elektron di anoda (kutub negatif), kemudian elektron mengalir melalui kawat luar menuju katoda (kutub positif) tempat berlangsungnya reaksi reduksi.'
  },
  {
    id: 3,
    question: 'Jembatan garam berisi larutan KNO₃. Ketika sel volta bekerja, ion K⁺ akan bermigrasi ke...',
    options: [
      'Kompartemen anoda untuk menetralkan kelebihan ion Zn²⁺',
      'Kompartemen katoda untuk menggantikan kation Cu²⁺ yang mengendap',
      'Voltmeter untuk memutar jarum penunjuk',
      'Kawat sirkuit luar menggantikan aliran elektron'
    ],
    correctIndex: 1,
    explanation: 'Di kompartemen katoda, ion positif (Cu²⁺) tereduksi menjadi endapan Cu, meninggalkan kelebihan anion SO₄²⁻. Kation K⁺ dari jembatan garam bermigrasi ke katoda guna menjaga kenetralan muatan larutan.'
  },
  {
    id: 4,
    question: 'Berdasarkan Persamaan Nernst: E_sel = E°_sel - (0,0592/n)·log([Anoda]/[Katoda]), jika konsentrasi larutan katoda [Cu²⁺] dinaikkan, maka potensial sel E_sel akan...',
    options: [
      'Menjadi bernilai nol (sel mati)',
      'Menurun karena reaksi berlangsung lambat',
      'Meningkat sesuai asas pergeseran kesetimbangan Le Chatelier',
      'Tidak berubah karena hanya dipengaruhi oleh jenis elektroda'
    ],
    correctIndex: 2,
    explanation: 'Reaksi sel: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s). Menaikkan reaktan [Cu²⁺] membuat nilai Q = [Zn²⁺]/[Cu²⁺] mengecil, sehingga nilai log Q menjadi lebih negatif, yang mengakibatkan nilai E_sel bertambah besar.'
  },
  {
    id: 5,
    question: 'Diberikan: E° Mg²⁺/Mg = -2,37 V dan E° Ag⁺/Ag = +0,80 V. Nilai potensial sel standar (E°_sel) yang dihasilkan dari pasangan ini adalah...',
    options: [
      '+1,57 Volt',
      '+3,17 Volt',
      '-3,17 Volt',
      '+0,77 Volt'
    ],
    correctIndex: 1,
    explanation: 'E°_sel = E°_katoda (Ag) - E°_anoda (Mg) = (+0,80 V) - (-2,37 V) = +0,80 + 2,37 = +3,17 Volt.'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptQuizModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (qId: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Kuis Evaluasi Konsep Sel Volta SMA
              </h2>
              <p className="text-xs text-slate-400">
                Uji pemahaman tentang anoda, katoda, jembatan garam, dan potensial Nernst
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Questions Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {submitted && (
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              score >= 4
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    Hasil Kuis: Skor Anda {score} / {QUIZ_QUESTIONS.length} ({((score / QUIZ_QUESTIONS.length) * 100).toFixed(0)}%)
                  </h3>
                  <p className="text-xs opacity-90">
                    {score === 5
                      ? 'Luar biasa! Penguasaan materi elektrokimia Anda sangat sempurna.'
                      : score >= 3
                      ? 'Bagus! Cermati kembali pembahasan di bawah untuk memantapkan konsep.'
                      : 'Perlu latihan lagi. Teliti kembali konsep anoda-katoda dan arah aliran elektron.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Ulangi Kuis
              </button>
            </div>
          )}

          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q, index) => {
              const userAns = selectedAnswers[q.id];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-cyan-400 shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                      {q.question}
                    </p>
                  </div>

                  <div className="space-y-2 pl-7">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white';
                      if (userAns === optIdx) {
                        btnStyle = 'bg-cyan-950/70 border-cyan-500 text-cyan-200';
                      }
                      if (submitted) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                        } else if (userAns === optIdx && !isCorrect) {
                          btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelect(q.id, optIdx)}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {submitted && optIdx === q.correctIndex && (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                          )}
                          {submitted && userAns === optIdx && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="pl-7 pt-1">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                        <strong className="text-cyan-400">Pembahasan:</strong> {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {Object.keys(selectedAnswers).length} dari {QUIZ_QUESTIONS.length} soal dijawab
          </span>

          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5"
            >
              <span>Periksa Jawaban</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all"
            >
              Tutup Kuis
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
