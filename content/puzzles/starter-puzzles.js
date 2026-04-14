(function (root) {
  root.HOMONYM_PUZZLES = [
    {
      id: 'starter-001',
      clue: 'loathsome test tube',
      displayAnswer: 'vile vial',
      answerWords: ['vile', 'vial'],
      aliases: ['vile-vial'],
      explanation: ['vile = loathsome', 'vial = test tube / small lab bottle'],
      difficulty: 'easy',
      status: 'reviewed',
      notes: 'Clean adjective + noun phrase with a sharp sound-pair payoff.',
    },
    {
      id: 'starter-002',
      clue: 'lazy golden calf',
      displayAnswer: 'idle idol',
      answerWords: ['idle', 'idol'],
      aliases: ['idle-idol'],
      explanation: ['idle = lazy', 'idol = golden calf / object of worship'],
      difficulty: 'easy',
      status: 'reviewed',
      notes: 'Strong model example for the intended clue and answer shape.',
    },
    {
      id: 'starter-003',
      clue: "thief of shepherd\'s tools",
      displayAnswer: 'crook crook',
      answerWords: ['crook', 'crook'],
      aliases: [],
      explanation: ['crook = thief / criminal', "crook = shepherd\'s hooked staff"],
      difficulty: 'medium',
      status: 'prototype',
      notes: 'Useful boundary case because the repeated sound is funny but editorially riskier.',
    },
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
