import type { Celebration, Slide } from '@/lib/types';
import HeroSlide from './slides/HeroSlide';
import TraitsSlide from './slides/TraitsSlide';
import PhotoWallSlide from './slides/PhotoWallSlide';
import ChatReplaySlide from './slides/ChatReplaySlide';
import LetterSlide from './slides/LetterSlide';
import CandleBlowSlide from './slides/CandleBlowSlide';
import GiftRevealSlide from './slides/GiftRevealSlide';
import ThankYouSlide from './slides/ThankYouSlide';
import GenericSlide from './slides/GenericSlide';

interface Props {
  slide: Slide;
  celebration: Celebration;
  slideIndex: number;
  totalSlides: number;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const SlideRenderer = ({ slide, celebration, onNext, onPrev, isFirst, isLast }: Props) => {
  const navProps = {
    onNext: isLast ? undefined : onNext,
    onPrev: isFirst ? undefined : onPrev,
  };

  const content = slide.content as Record<string, any>;
  const slideType = slide.slideType;

  switch (slideType) {
    case 'hero':
      return (
        <HeroSlide
          recipientName={celebration.recipientName}
          recipientPhotoUrl={content.recipientPhotoUrl || celebration.recipientPhotoUrl}
          title={content.title || `Happy ${celebration.occasion}!`}
          subtitle={content.subtitle || celebration.recipientName}
          occasion={celebration.occasion}
          {...navProps}
        />
      );

    case 'traits':
      return (
        <TraitsSlide
          items={content.items || []}
          cameraEnabled={content.cameraEnabled !== false}
          {...navProps}
        />
      );

    case 'photo_wall':
      return (
        <PhotoWallSlide
          photos={content.photos || []}
          recipientName={celebration.recipientName}
          {...navProps}
        />
      );

    case 'chat_replay':
      return (
        <ChatReplaySlide
          messages={content.messages || []}
          headerTitle={content.headerTitle || `${celebration.recipientName} & Me`}
          {...navProps}
        />
      );

    case 'letter':
      return (
        <LetterSlide
          paragraphs={content.paragraphs || [content.body || '']}
          signature={content.signature || ''}
          recipientName={celebration.recipientName}
          {...navProps}
        />
      );

    case 'candle_blow':
      return (
        <CandleBlowSlide
          recipientName={celebration.recipientName}
          occasion={celebration.occasion}
          {...navProps}
        />
      );

    case 'gift_reveal':
      return (
        <GiftRevealSlide
          giftTitle={content.giftTitle || celebration.giftTitle || ''}
          giftUrl={content.giftUrl || celebration.giftUrl || ''}
          giftDescription={content.giftDescription || celebration.giftDescription || ''}
          recipientName={celebration.recipientName}
          {...navProps}
        />
      );

    case 'thank_you':
      return (
        <ThankYouSlide
          celebrationId={celebration.id}
          creatorName={content.creatorName || 'someone special'}
          {...navProps}
        />
      );

    default:
      return <GenericSlide type={slideType} {...navProps} />;
  }
};

export default SlideRenderer;
