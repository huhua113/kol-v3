import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AddKolModalProps {
  onClose: () => void;
  onImport: (importText: string) => void;
}

export const AddKolModal: React.FC<AddKolModalProps> = ({ onClose, onImport }) => {
  const [importText, setImportText] = useState('');

  const handleImportClick = () => {
    onImport(importText);
  };

  return (
    <div className="fixed inset-0 bg-brand-text/20 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
      <Card className="w-full max-w-sm animate-scale-in">
        <h3 className="font-bold text-lg mb-4 text-brand-text">批量导入专家</h3>
        <div className="bg-brand-light rounded-xl p-4 mb-5 border border-brand-border">
          <textarea className="w-full h-36 bg-transparent border-none text-sm focus:outline-none resize-none font-bold text-brand-text" placeholder={`韩晓东 上海市交通大学医学院附属第六人民医院 外科\n吴江 华东医院 营养科`} value={importText} onChange={e => setImportText(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">取消</Button>
          <Button onClick={handleImportClick} className="flex-1">开始导入</Button>
        </div>
      </Card>
    </div>
  );
};
