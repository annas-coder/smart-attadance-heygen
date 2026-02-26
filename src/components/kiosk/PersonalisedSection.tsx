import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UserGrid from './UserGrid';
import ResultView from './ResultView';
import ScanOverlay from './ScanOverlay';
import { PEOPLE, Person } from '@/lib/kioskData';

const slideVariants = {
  enterFromRight: { opacity: 0, x: 60 },
  enterFromLeft: { opacity: 0, x: -60 },
  center: { opacity: 1, x: 0 },
  exitToLeft: { opacity: 0, x: -60 },
  exitToRight: { opacity: 0, x: 60 },
};

const PersonalisedSection = () => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanPhoto, setScanPhoto] = useState<string | null>(null);
  const [scanName, setScanName] = useState<string | undefined>();
  const directionRef = useRef<'forward' | 'back'>('forward');

  const handleSelect = (index: number) => {
    const user = PEOPLE[index];
    setScanPhoto(user.photo);
    setScanName(user.f);
    setScanning(true);
    directionRef.current = 'forward';
    setTimeout(() => {
      setScanning(false);
      setSelectedPerson(user);
    }, 2000);
  };

  const handleBack = () => {
    directionRef.current = 'back';
    setSelectedPerson(null);
  };

  const isForward = directionRef.current === 'forward';

  return (
    <>
      <ScanOverlay visible={scanning} photo={scanPhoto} personName={scanName} />
      <AnimatePresence mode="wait">
        {selectedPerson ? (
          <motion.div
            key="result"
            initial={isForward ? 'enterFromRight' : 'enterFromLeft'}
            animate="center"
            exit={isForward ? 'exitToRight' : 'exitToLeft'}
            variants={slideVariants}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <ResultView person={selectedPerson} onBack={handleBack} />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={isForward ? 'enterFromRight' : 'enterFromLeft'}
            animate="center"
            exit={isForward ? 'exitToLeft' : 'exitToRight'}
            variants={slideVariants}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <UserGrid onSelect={handleSelect} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PersonalisedSection;
