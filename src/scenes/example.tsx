import {Circle, Rect, Txt, Gradient, makeScene2D} from '@motion-canvas/2d';
import {
  createRef,
  all,
  loop,
  waitFor,
  easeOutCubic,
  easeOutBack,
  easeInOutCubic,
} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  // ---------------------------------------------------------------------------
  // References
  // ---------------------------------------------------------------------------
  const circle = createRef<Circle>();
  const heading = createRef<Txt>();
  const subtitle = createRef<Txt>();

  // ---------------------------------------------------------------------------
  // Background — dark, clean vertical gradient around #1a1a24
  // ---------------------------------------------------------------------------
  view.add(
    <Rect
      width={'100%'}
      height={'100%'}
      fill={new Gradient({
        type: 'linear',
        from: [0, -540],
        to: [0, 540],
        stops: [
          {offset: 0, color: '#20202e'},
          {offset: 0.5, color: '#1a1a24'},
          {offset: 1, color: '#121218'},
        ],
      })}
    />,
  );

  // ---------------------------------------------------------------------------
  // Central shape — glowing circle with a radial gradient
  // ---------------------------------------------------------------------------
  view.add(
    <Circle
      ref={circle}
      y={70}
      size={300}
      scale={0}
      fill={new Gradient({
        type: 'radial',
        from: [0, 0],
        to: [0, 0],
        fromRadius: 0,
        toRadius: 150,
        stops: [
          {offset: 0, color: '#7aa2ff'},
          {offset: 1, color: '#3a5cff'},
        ],
      })}
      shadowColor={'#4f7cff'}
      shadowBlur={90}
    />,
  );

  // ---------------------------------------------------------------------------
  // Heading — bold, clean, top of frame
  // ---------------------------------------------------------------------------
  view.add(
    <Txt
      ref={heading}
      text={'Unlock AI Power'}
      y={-330}
      opacity={0}
      scale={0.9}
      fontFamily={'Inter, Arial, sans-serif'}
      fontWeight={800}
      fontSize={92}
      letterSpacing={2}
      fill={'#ffffff'}
    />,
  );

  // ---------------------------------------------------------------------------
  // Subtitle — second line that changes over time
  // ---------------------------------------------------------------------------
  view.add(
    <Txt
      ref={subtitle}
      text={''}
      y={-230}
      opacity={0}
      fontFamily={'Inter, Arial, sans-serif'}
      fontWeight={400}
      fontSize={42}
      letterSpacing={1}
      fill={'#9aa3c7'}
    />,
  );

  // ---------------------------------------------------------------------------
  // Intro — shape scales up, heading fades and settles in
  // ---------------------------------------------------------------------------
  yield* all(
    circle().scale(1, 1.1, easeOutBack),
    heading().opacity(1, 0.8, easeOutCubic),
    heading().scale(1, 0.8, easeOutCubic),
    heading().y(-300, 0.8, easeOutCubic),
  );

  // Gentle continuous pulse on the shape for the rest of the scene.
  yield loop(function* () {
    yield* circle()
      .scale(1.06, 1.6, easeInOutCubic)
      .to(1, 1.6, easeInOutCubic);
  });

  // ---------------------------------------------------------------------------
  // Rotating subtitle lines (fade-swap between phrases)
  // ---------------------------------------------------------------------------
  const lines = [
    'Automate the busywork.',
    'Ship ideas 10× faster.',
    'Built for what comes next.',
  ];

  subtitle().text(lines[0]);
  yield* subtitle().opacity(1, 0.6, easeOutCubic);
  yield* waitFor(2.0);

  for (let i = 1; i < lines.length; i++) {
    yield* subtitle().opacity(0, 0.4, easeInOutCubic);
    subtitle().text(lines[i]);
    yield* subtitle().opacity(1, 0.4, easeInOutCubic);
    yield* waitFor(2.0);
  }

  // Final beat
  yield* waitFor(0.4);
});
