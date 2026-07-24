import {makeScene2D, Rect, Img, Txt, Gradient, blur} from '@motion-canvas/2d';
import {
  createRef,
  all,
  waitFor,
  easeInOutSine,
  easeInOutCubic,
  easeOutCubic,
  easeOutBack,
  linear,
} from '@motion-canvas/core';

/*
 * TRYB — Website Launch Video
 * -------------------------------------------------------------------------
 * Format   : 9:16 vertical, 1080 x 1920 (set this resolution in the
 *            Motion Canvas "Video Settings" panel before rendering).
 * Length   : ~88 seconds, six chapters, following the launch script.
 * Look     : cinematic — each frame sits on a blurred fill of itself,
 *            with a slow Ken-Burns push, crossfades, a bottom scrim and
 *            voice-over captions in the lower third.
 * Assets   : cropped from the brand storyboard sheet (see ./assets/tryb).
 *
 * NOTE: the source frames are ~280px wide, so they are shown inside a
 * centred card over a blurred backdrop rather than pixel-stretched full
 * screen — that keeps them sharp and reads as a premium vertical edit.
 * -------------------------------------------------------------------------
 */

// --- Scene 1 — Hook ---------------------------------------------------------
import s1_scrolling from './assets/tryb/s1_scrolling.png';
import s1_notifications from './assets/tryb/s1_notifications.png';
import s1_deadchats from './assets/tryb/s1_deadchats.png';
import s1_calendar from './assets/tryb/s1_calendar.png';
import s1_cafe from './assets/tryb/s1_cafe.png';
// --- Scene 2 — The Problem --------------------------------------------------
import s2_cancelling from './assets/tryb/s2_cancelling.png';
import s2_dating from './assets/tryb/s2_dating.png';
import s2_instagram from './assets/tryb/s2_instagram.png';
import s2_couple from './assets/tryb/s2_couple.png';
import s2_weekend from './assets/tryb/s2_weekend.png';
// --- Scene 3 — The Idea -----------------------------------------------------
import s3_logo from './assets/tryb/s3_logo.png';
import s3_questions from './assets/tryb/s3_questions.png';
import s3_invite from './assets/tryb/s3_invite.png';
import s3_coffee from './assets/tryb/s3_coffee.png';
import s3_hiking from './assets/tryb/s3_hiking.png';
import s3_dinner from './assets/tryb/s3_dinner.png';
import s3_pottery from './assets/tryb/s3_pottery.png';
import s3_boardgames from './assets/tryb/s3_boardgames.png';
// --- Scene 4 — How It Works -------------------------------------------------
import s4_answers from './assets/tryb/s4_answers.png';
import s4_matches from './assets/tryb/s4_matches.png';
import s4_invite from './assets/tryb/s4_invite.png';
import s4_gathering from './assets/tryb/s4_gathering.png';
// --- Scene 5 — The Emotion --------------------------------------------------
import s5_laughter from './assets/tryb/s5_laughter.png';
import s5_sunset from './assets/tryb/s5_sunset.png';
import s5_coffeechat from './assets/tryb/s5_coffeechat.png';
import s5_walking from './assets/tryb/s5_walking.png';
// --- Scene 6 — Ending -------------------------------------------------------
import s6_logo from './assets/tryb/s6_logo.png';
import s6_website from './assets/tryb/s6_website.png';

// Brand palette
const BRAND_CREAM = '#f2e6cf';
const INK = '#141018';
const CAPTION = '#f4f0ea';

export default makeScene2D(function* (view) {
  const W = 1080;
  const H = 1920;

  // ---------------------------------------------------------------------------
  // Background fill (deep cinematic gradient sits behind everything)
  // ---------------------------------------------------------------------------
  view.add(
    <Rect
      width={W}
      height={H}
      zIndex={-1}
      fill={new Gradient({
        type: 'linear',
        from: [0, -H / 2],
        to: [0, H / 2],
        stops: [
          {offset: 0, color: '#17141f'},
          {offset: 1, color: '#0b0910'},
        ],
      })}
    />,
  );

  // ---------------------------------------------------------------------------
  // Two ping-pong "beat" layers, each: blurred backdrop + darken + sharp card.
  // Crossfading between the two gives seamless dissolves between frames.
  // ---------------------------------------------------------------------------
  const roots = [createRef<Rect>(), createRef<Rect>()];
  const bgs = [createRef<Img>(), createRef<Img>()];
  const cards = [createRef<Img>(), createRef<Img>()];

  for (let i = 0; i < 2; i++) {
    view.add(
      <Rect ref={roots[i]} width={W} height={H} clip opacity={0} zIndex={i + 1}>
        <Img ref={bgs[i]} height={H + 160} filters={[blur(34)]} />
        <Rect width={W} height={H} fill={'#000000'} opacity={0.5} />
        <Img
          ref={cards[i]}
          width={980}
          y={-210}
          radius={26}
          shadowColor={'#000000'}
          shadowBlur={70}
          shadowOffset={[0, 24]}
        />
      </Rect>,
    );
  }

  // ---------------------------------------------------------------------------
  // Bottom scrim so captions stay legible over any frame
  // ---------------------------------------------------------------------------
  view.add(
    <Rect
      width={W}
      height={880}
      y={H / 2 - 440}
      zIndex={5}
      fill={new Gradient({
        type: 'linear',
        from: [0, -440],
        to: [0, 440],
        stops: [
          {offset: 0, color: '#00000000'},
          {offset: 1, color: '#000000e6'},
        ],
      })}
    />,
  );

  // Cinematic vignette
  view.add(
    <Rect
      width={W}
      height={H}
      zIndex={6}
      opacity={0.6}
      fill={new Gradient({
        type: 'radial',
        from: [0, 0],
        to: [0, 0],
        fromRadius: 300,
        toRadius: 1180,
        stops: [
          {offset: 0, color: '#00000000'},
          {offset: 1, color: '#000000cc'},
        ],
      })}
    />,
  );

  // Voice-over caption (lower third)
  const caption = createRef<Txt>();
  view.add(
    <Txt
      ref={caption}
      zIndex={10}
      y={540}
      width={940}
      textAlign={'center'}
      textWrap
      opacity={0}
      fontFamily={'Poppins, Inter, sans-serif'}
      fontWeight={500}
      fontSize={50}
      lineHeight={62}
      letterSpacing={0.5}
      fill={CAPTION}
      shadowColor={'#000000'}
      shadowBlur={18}
    />,
  );

  // Full-frame blackout for dips between chapters
  const blackout = createRef<Rect>();
  view.add(
    <Rect ref={blackout} width={W} height={H} zIndex={30} fill={'#000000'} opacity={0} />,
  );

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  let cur = 0;

  // Crossfade a new frame in over the previous, with a slow Ken-Burns push.
  function* show(src: string, dur: number, push = 0.14) {
    const root = roots[cur];
    const bg = bgs[cur];
    const card = cards[cur];

    root().zIndex(2);
    roots[1 - cur]().zIndex(1);

    bg().src(src);
    card().src(src);
    bg().scale(1.05);
    card().scale(1.0);
    root().opacity(0);

    yield* all(
      root().opacity(1, 0.7, easeInOutSine),
      bg().scale(1.05 + push + 0.05, dur, linear),
      card().scale(1.0 + push * 0.5, dur, linear),
    );
    cur = 1 - cur;
  }

  // Voice-over line: fade + rise in, hold, fade out.
  function* say(text: string, hold: number, inT = 0.5, outT = 0.5) {
    caption().text(text);
    caption().opacity(0);
    caption().y(560);
    yield* all(
      caption().opacity(1, inT, easeOutCubic),
      caption().y(540, inT, easeOutCubic),
    );
    yield* waitFor(hold);
    yield* caption().opacity(0, outT, easeInOutCubic);
  }

  function* dip(t = 0.5) {
    yield* blackout().opacity(1, t, easeInOutCubic);
  }

  // ===========================================================================
  // SCENE 1 — HOOK (0–13s)
  // ===========================================================================
  yield* all(
    (function* () {
      yield* show(s1_scrolling, 2.4);
      yield* show(s1_notifications, 2.4);
      yield* show(s1_deadchats, 2.6);
      yield* show(s1_calendar, 2.6);
      yield* show(s1_cafe, 3.0, 0.18);
    })(),
    (function* () {
      yield* say('We have never been\nmore connected.', 3.4);
      yield* say('Yet somehow…', 1.5);
      yield* say("we've never found it harder\nto spend time together.", 5.1);
    })(),
  );

  // ===========================================================================
  // SCENE 2 — THE PROBLEM (13–28s)
  // ===========================================================================
  yield* all(
    (function* () {
      yield* show(s2_cancelling, 3.0);
      yield* show(s2_dating, 3.0);
      yield* show(s2_instagram, 3.0);
      yield* show(s2_couple, 3.0);
      yield* show(s2_weekend, 3.0);
    })(),
    (function* () {
      yield* say("Making plans shouldn't\nfeel like work.", 3.0);
      yield* say('Finding the right people\nshouldn’t be left to chance.', 4.5);
      yield* say('And your weekends shouldn’t\ndisappear before they begin.', 4.5);
    })(),
  );

  // ===========================================================================
  // SCENE 3 — THE IDEA (28–45s) — brand reveal
  // ===========================================================================
  yield* all(
    (function* () {
      yield* show(s3_logo, 3.0, 0.06);
      yield* show(s3_questions, 3.0);
      yield* show(s3_invite, 3.0);
      // Energetic experience montage
      yield* show(s3_coffee, 1.6, 0.2);
      yield* show(s3_hiking, 1.6, 0.2);
      yield* show(s3_dinner, 1.6, 0.2);
      yield* show(s3_pottery, 1.6, 0.2);
      yield* show(s3_boardgames, 1.6, 0.2);
    })(),
    (function* () {
      yield* say('So we built TRYB.', 2.0);
      yield* say('Not another social app.', 2.0);
      yield* say('Not another events platform.', 2.0);
      yield* say('A better way\nto experience real life.', 7.0);
    })(),
  );

  // ===========================================================================
  // SCENE 4 — HOW IT WORKS (45–63s)
  // ===========================================================================
  yield* all(
    (function* () {
      yield* show(s4_answers, 4.0);
      yield* show(s4_matches, 4.0);
      yield* show(s4_invite, 4.0);
      yield* show(s4_gathering, 6.0, 0.18);
    })(),
    (function* () {
      yield* say('Tell us who you are.', 3.0);
      yield* say('We curate the people.', 3.0);
      yield* say('We design the experience.', 3.0);
      yield* say('You simply show up.', 1.4);
      yield* say('Every experience helps us\ncurate the next one, better.', 2.6);
    })(),
  );

  // ===========================================================================
  // SCENE 5 — THE EMOTION (63–79s)
  // ===========================================================================
  yield* all(
    (function* () {
      yield* show(s5_laughter, 4.0, 0.16);
      yield* show(s5_sunset, 4.0, 0.16);
      yield* show(s5_coffeechat, 4.0, 0.16);
      yield* show(s5_walking, 4.0, 0.16);
    })(),
    (function* () {
      yield* say("Because the best memories\naren't made online.", 3.0);
      yield* say('They’re made over\nconversations…', 3.0);
      yield* say('shared tables…\nunexpected laughter…', 3.0);
      yield* say('…and people who\nsimply feel right.', 3.0);
    })(),
  );

  // ===========================================================================
  // SCENE 6 — ENDING (79–88s)
  // ===========================================================================
  // Website beat
  yield* all(
    show(s6_website, 3.0, 0.12),
    say('Give yourself a chance.', 2.0),
  );

  // Composed sign-off — an opaque panel dissolves in over the last frame.
  const endGroup = createRef<Rect>();
  const endLogo = createRef<Img>();
  const endLine = createRef<Txt>();
  const tagline = createRef<Txt>();
  const joinPill = createRef<Rect>();
  const joinTxt = createRef<Txt>();
  const website = createRef<Txt>();

  view.add(
    <Rect ref={endGroup} width={W} height={H} zIndex={8} opacity={0}
      fill={new Gradient({
        type: 'linear',
        from: [0, -H / 2],
        to: [0, H / 2],
        stops: [
          {offset: 0, color: '#181320'},
          {offset: 1, color: '#0a0810'},
        ],
      })}
    >
      <Img ref={endLogo} src={s6_logo} width={620} y={-360} scale={0.86} />
      <Txt
        ref={endLine}
        y={40}
        width={900}
        textAlign={'center'}
        textWrap
        opacity={0}
        fontFamily={'Poppins, Inter, sans-serif'}
        fontWeight={400}
        fontSize={52}
        lineHeight={66}
        fill={CAPTION}
      />
      <Txt
        ref={tagline}
        y={40}
        width={960}
        textAlign={'center'}
        textWrap
        opacity={0}
        fontFamily={'Poppins, Inter, sans-serif'}
        fontWeight={600}
        fontSize={58}
        lineHeight={72}
        fill={BRAND_CREAM}
      />
      <Rect ref={joinPill} y={330} width={360} height={104} radius={52}
        fill={BRAND_CREAM} scale={0} opacity={0}
        shadowColor={'#000000'} shadowBlur={40} shadowOffset={[0, 16]}>
        <Txt ref={joinTxt} text={'Join TRYB'} fontFamily={'Poppins, Inter, sans-serif'}
          fontWeight={600} fontSize={44} fill={INK} />
      </Rect>
      <Txt ref={website} y={470} text={'www.tryb.app'} opacity={0}
        fontFamily={'Poppins, Inter, sans-serif'} fontWeight={400}
        fontSize={34} letterSpacing={3} fill={'#8f8a99'} />
    </Rect>,
  );

  // Logo settles in
  yield* all(
    endGroup().opacity(1, 0.9, easeOutCubic),
    endLogo().scale(1, 1.0, easeOutCubic),
  );

  // Voice-over lines cycle above the mark
  const lines = ['Your people are out there.', 'We’ll help you find them.'];
  for (const l of lines) {
    endLine().text(l);
    endLine().y(60);
    yield* all(
      endLine().opacity(1, 0.5, easeOutCubic),
      endLine().y(40, 0.5, easeOutCubic),
    );
    yield* waitFor(1.6);
    yield* endLine().opacity(0, 0.4, easeInOutCubic);
  }

  // Final tagline + call to action
  tagline().text('Welcome to TRYB.');
  tagline().y(70);
  yield* all(
    tagline().opacity(1, 0.7, easeOutCubic),
    tagline().y(40, 0.7, easeOutCubic),
  );
  yield* all(
    joinPill().scale(1, 0.6, easeOutBack),
    joinPill().opacity(1, 0.4),
  );
  yield* website().opacity(1, 0.6);
  yield* waitFor(1.6);

  // Slow fade to black
  yield* dip(1.2);
});
