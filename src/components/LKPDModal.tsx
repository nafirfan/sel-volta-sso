import React, { useState } from 'react';
import { ObservationItem } from '../types/electrochemistry';
import { FileText, Printer, Trash2, Plus, Download, CheckCircle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  observations: ObservationItem[];
  onAddCurrentObservation: (notes: string) => void;
  onRemoveObservation: (id: string) => void;
  onClearAll: () => void;
}

export const LKPDModal: React.FC<Props> = ({
  isOpen,
  onClose,
  observations,
  onAddCurrentObservation,
  onRemoveObservation,
  onClearAll,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('XII MIPA');
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (observations.length === 0) return;
    const headers = ['No', 'Waktu', 'Pasangan Sel', 'Anoda', '[Anoda] (M)', 'Katoda', '[Katoda] (M)', 'E0 Teori (V)', 'E Terukur (V)', 'Catatan'];
    const rows = observations.map((obs, idx) => [
      idx + 1,
      obs.timestamp,
      `"${obs.pairName}"`,
      obs.anodeMetal,
      obs.anodeConc,
      obs.cathodeMetal,
      obs.cathodeConc,
      obs.E0_theory,
      obs.E_measured,
      `"${obs.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LKPD_Sel_Volta_${studentName || 'Siswa'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg print:hidden">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white print:text-black">
                Lembar Kerja Peserta Didik (LKPD) Virtual Sel Volta
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-700">
                Tabel Pengamatan Eksperimen Kimia Elektrokimia SMA Kelas XII
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 overflow-y-auto print:p-0 print:space-y-4">
          {/* Student Identitas Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 print:bg-transparent print:border-slate-300">
            <div>
              <label className="block text-xs font-semibold text-slate-300 print:text-black mb-1">
                Nama Lengkap Siswa / Anggota Kelompok:
              </label>
              <input
                type="text"
                placeholder="Contoh: Siti Rahma & Tim"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 print:bg-white print:text-black print:border-b print:border-t-0 print:border-x-0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 print:text-black mb-1">
                Kelas / Peminatan:
              </label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 print:bg-white print:text-black print:border-b print:border-t-0 print:border-x-0"
              />
            </div>
          </div>

          {/* Add current state action banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-cyan-950/30 border border-cyan-800/40 p-3.5 rounded-xl print:hidden">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-medium text-cyan-300 mb-1">
                Catatan Pengamatan untuk Kondisi Sekarang:
              </label>
              <input
                type="text"
                placeholder="Misal: Batang Cu menebal kemerahan, jarum voltmeter stabil..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              onClick={() => {
                onAddCurrentObservation(customNote || 'Pengamatan simulasi');
                setCustomNote('');
              }}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Catat Data Terkini ke Tabel
            </button>
          </div>

          {/* Observations Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
                Tabel Hasil Pengukuran dan Perhitungan
              </h3>
              {observations.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 print:hidden"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Semua Data
                </button>
              )}
            </div>

            {observations.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 border border-slate-800 rounded-xl text-xs text-slate-400">
                Belum ada data pengamatan yang dicatat. Klik tombol <strong>"Catat Data Terkini ke Tabel"</strong> setelah menyetel konsentrasi atau pasangan sel volta!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-300 print:bg-slate-100 print:text-black">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">No</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">Pasangan Sel</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">Anoda (-)</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">[Anoda]</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">Katoda (+)</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">[Katoda]</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">E° Teori</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">E Terukur</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:border-black">Catatan Siswa</th>
                      <th className="py-2.5 px-3 font-semibold border-b border-slate-800 print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {observations.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                        <td className="py-2 px-3 font-mono text-slate-400 print:text-black">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-slate-200 print:text-black">{item.pairName}</td>
                        <td className="py-2 px-3 text-sky-400 print:text-black font-semibold">{item.anodeMetal}</td>
                        <td className="py-2 px-3 font-mono text-slate-300 print:text-black">{item.anodeConc.toFixed(2)} M</td>
                        <td className="py-2 px-3 text-rose-400 print:text-black font-semibold">{item.cathodeMetal}</td>
                        <td className="py-2 px-3 font-mono text-slate-300 print:text-black">{item.cathodeConc.toFixed(2)} M</td>
                        <td className="py-2 px-3 font-mono text-slate-300 print:text-black">+{item.E0_theory.toFixed(2)} V</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-400 print:text-black">+{item.E_measured.toFixed(3)} V</td>
                        <td className="py-2 px-3 text-slate-400 print:text-slate-700 italic">{item.notes}</td>
                        <td className="py-2 px-3 print:hidden">
                          <button
                            onClick={() => onRemoveObservation(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Student Synthesis Questions */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800 print:bg-transparent print:border-slate-300">
            <h4 className="text-xs font-bold text-slate-200 print:text-black uppercase tracking-wider">
              Pertanyaan Diskusi & Kesimpulan Mandiri
            </h4>
            <div className="space-y-2 text-xs text-slate-300 print:text-black">
              <p>
                <strong>1. Hubungan Konsentrasi dan Tegangan Sel:</strong> Bagaimana perubahan beda potensial sel (E<sub>sel</sub>) ketika konsentrasi larutan katoda dinaikkan dibanding konsentrasi larutan anoda? Jelaskan dengan mengaitkan Persamaan Nernst dan Asas Le Chatelier!
              </p>
              <div className="border border-dashed border-slate-700 p-3 rounded-lg min-h-[50px] text-slate-500 italic print:border-slate-400">
                (Tuliskan analisa siswa di sini...)
              </div>

              <p className="mt-2">
                <strong>2. Peran Jembatan Garam:</strong> Mengapa arus listrik tidak mengalir jika jembatan garam dicabut dari kedua bejana?
              </p>
              <div className="border border-dashed border-slate-700 p-3 rounded-lg min-h-[50px] text-slate-500 italic print:border-slate-400">
                (Tuliskan analisa siswa di sini...)
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-400">
            Total {observations.length} data pengamatan tercatat
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={observations.length === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Ekspor CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
