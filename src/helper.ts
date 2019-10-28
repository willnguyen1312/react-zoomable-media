interface FullscreenApiMap {
  exitFullscreen: string;
  requestFullscreen: string;
  fullscreenElement: string;
  fullscreenchange: string;
}

type FullscreenLookup = FullscreenApiMap | false;

export const fullscreenLookup = (() => {
  const propLists = [
    // Standard - Chrome, Edge, etc
    [
      'exitFullscreen',
      'requestFullscreen',
      'fullscreenElement',
      'fullscreenchange',
    ],
    // WebKit
    [
      'webkitExitFullscreen',
      'webkitRequestFullscreen',
      'webkitFullscreenElement',
      'webkitfullscreenchange',
    ],
    // Mozilla Firefox
    [
      'mozCancelFullScreen',
      'mozRequestFullScreen',
      'mozFullScreenElement',
      'mozfullscreenchange',
    ],
    // IE
    [
      'msExitFullscreen',
      'msRequestFullscreen',
      'msFullscreenElement',
      'MSFullscreenChange',
    ],
  ];

  for (const propList of propLists) {
    // The first element of the propList is available in all supported browsers
    if (propList[0] in document) {
      return propList.reduce((acc: any, cur, index) => {
        // Return the map of standard Fullscreen API
        acc[propLists[0][index]] = cur;
        return acc;
      }, {});
    }
  }

  return false;
})() as FullscreenLookup;
