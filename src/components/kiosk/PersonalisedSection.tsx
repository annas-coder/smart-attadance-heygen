import { useState } from 'react';
import UserGrid from './UserGrid';
import ResultView from './ResultView';
import ScanOverlay from './ScanOverlay';
import { PEOPLE, Person } from '@/lib/kioskData';

const PersonalisedSection = () => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanPhoto, setScanPhoto] = useState<string | null>(null);

  const handleSelect = (index: number) => {
    const user = PEOPLE[index];
    setScanPhoto(user.photo);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setSelectedPerson(user);
    }, 2000);
  };

  const handleBack = () => {
    setSelectedPerson(null);
  };

  return (
    <>
      <ScanOverlay visible={scanning} photo={scanPhoto} />
      {selectedPerson ? (
        <ResultView person={selectedPerson} onBack={handleBack} />
      ) : (
        <UserGrid onSelect={handleSelect} />
      )}
    </>
  );
};

export default PersonalisedSection;
