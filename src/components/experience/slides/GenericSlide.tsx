import NavigationButtons from '@/components/birthday/NavigationButtons';

interface Props {
  type: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const GenericSlide = ({ type, onNext, onPrev }: Props) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4">
    <div className="text-4xl mb-3">📄</div>
    <p className="font-body text-muted-foreground text-sm mb-2">Slide type: {type}</p>
    <p className="font-body text-muted-foreground/50 text-xs">Coming soon</p>
    <NavigationButtons onNext={onNext} onPrev={onPrev} />
  </div>
);

export default GenericSlide;
