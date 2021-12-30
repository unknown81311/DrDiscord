const {
  React,
} = DrApi

const Plugins = React.memo((props) => React.createElement("svg", {
  fill: "currentcolor",
  viewBox: "0 0 24 24",
  children: React.createElement("path", {
    d: "M20,20H4c-1.105,0-2-0.895-2-2V9c0-1.105,0.895-2,2-2h1V5c0-0.552,0.448-1,1-1h4c0.552,0,1,0.448,1,1v2h2V5 c0-0.552,0.448-1,1-1h4c0.552,0,1,0.448,1,1v2h1c1.105,0,2,0.895,2,2v9C22,19.105,21.105,20,20,20z"
  }),
  ...props
}))

const Themes = React.memo((props) => React.createElement("svg", {
  fill: "currentcolor",
  viewBox: "0 0 24 24",
  children: React.createElement("path", {
    d: "M 7.15625 3.0292969 C 6.3771406 3.0476719 5.6462969 3.5239219 5.3417969 4.2949219 L 4.2714844 7 L 17.623047 7 L 7.9375 3.1699219 C 7.68075 3.0684219 7.4159531 3.0231719 7.15625 3.0292969 z M 5 9 C 3.897 9 3 9.897 3 11 L 3 19 C 3 20.103 3.897 21 5 21 L 19 21 C 20.103 21 21 20.103 21 19 L 21 11 C 21 9.897 20.103 9 19 9 L 5 9 z M 17 11 L 18 11 C 18.552 11 19 11.448 19 12 L 19 18 C 19 18.552 18.552 19 18 19 L 17 19 C 16.448 19 16 18.552 16 18 L 16 12 C 16 11.448 16.448 11 17 11 z"
  }),
  ...props
}))

const CustomCSS = React.memo((props) => React.createElement("svg", {
  fill: "currentcolor",
  viewBox: "0 0 50 50",
  children: React.createElement("path", {
    d: "M 31.148438 -0.0625 L 12.121094 18.964844 C 11.828125 19.253906 11.746094 19.695313 11.910156 20.070313 C 13.597656 23.914063 14.882813 28.789063 14.039063 29.632813 C 12.15625 31.515625 10.292969 32.285156 8.492188 33.03125 C 7.011719 33.644531 5.609375 34.226563 4.472656 35.363281 C 0.640625 39.195313 -1.546875 45.554688 1.445313 48.550781 C 2.359375 49.460938 3.667969 49.941406 5.238281 49.941406 C 8.265625 49.941406 11.953125 48.210938 14.636719 45.527344 C 15.886719 44.277344 16.804688 42.339844 17.695313 40.46875 C 18.515625 38.746094 19.359375 36.96875 20.363281 35.964844 C 20.613281 35.71875 21.105469 35.589844 21.796875 35.589844 C 24.839844 35.589844 29.832031 38.046875 29.882813 38.070313 C 30.269531 38.261719 30.730469 38.1875 31.035156 37.882813 L 36.371094 32.542969 L 44.925781 23.988281 C 44.964844 23.957031 45.015625 23.914063 45.039063 23.890625 C 45.050781 23.878906 45.054688 23.859375 45.066406 23.847656 L 50.0625 18.851563 Z M 7 45 C 5.894531 45 5 44.105469 5 43 C 5 41.898438 5.894531 41 7 41 C 8.105469 41 9 41.898438 9 43 C 9 44.105469 8.105469 45 7 45 Z M 36.371094 29.714844 L 20.285156 13.628906 L 23.152344 10.761719 C 23.308594 11.242188 23.59375 11.707031 24.027344 12.144531 C 25.898438 14.011719 29.164063 12.085938 29.800781 11.679688 C 32.054688 10.246094 33.023438 10.28125 33.113281 10.332031 C 33.25 10.613281 33.164063 11.53125 31.996094 14.292969 L 31.917969 14.476563 C 30.910156 16.867188 31.84375 18.304688 32.484375 18.953125 C 33.546875 20.011719 35.027344 19.640625 36.214844 19.339844 C 37.277344 19.074219 38 18.925781 38.351563 19.277344 C 38.785156 19.710938 38.5 20.792969 38.246094 21.746094 C 37.933594 22.9375 37.609375 24.164063 38.449219 25.007813 C 38.980469 25.539063 39.617188 25.765625 40.277344 25.808594 Z"
  }),
  ...props
}))

const Updater = React.memo((props) => React.createElement("svg", {
  fill: "currentcolor",
  viewBox: "0 0 50 50",
  children: React.createElement("path", {
    d: "M 24.78125 2.9375 C 23.75 3.050781 22.976563 3.933594 23 4.96875 L 23 28.6875 L 19.40625 25.09375 C 18.984375 24.660156 18.386719 24.441406 17.78125 24.5 C 17.003906 24.574219 16.339844 25.097656 16.085938 25.835938 C 15.828125 26.578125 16.027344 27.398438 16.59375 27.9375 L 25 36.34375 L 33.40625 27.9375 C 33.929688 27.4375 34.144531 26.695313 33.964844 25.992188 C 33.785156 25.292969 33.242188 24.742188 32.542969 24.554688 C 31.84375 24.367188 31.097656 24.574219 30.59375 25.09375 L 27 28.6875 L 27 4.96875 C 27.007813 4.425781 26.796875 3.90625 26.414063 3.523438 C 26.03125 3.140625 25.511719 2.929688 24.96875 2.9375 C 24.90625 2.933594 24.84375 2.933594 24.78125 2.9375 Z M 2 36 L 2 41.6875 C 2 43.164063 2.449219 44.59375 3.5 45.59375 C 4.550781 46.59375 5.996094 47 7.4375 47 L 42.59375 47 C 44.054688 47 45.5 46.585938 46.53125 45.5625 C 47.5625 44.539063 48 43.058594 48 41.59375 L 48 36 L 44 36 L 44 41.59375 C 44 42.328125 43.84375 42.597656 43.71875 42.71875 C 43.59375 42.839844 43.332031 43 42.59375 43 L 7.4375 43 C 6.679688 43 6.402344 42.832031 6.28125 42.71875 C 6.160156 42.605469 6 42.414063 6 41.6875 L 6 36 Z"
  }),
  ...props
}))

const CustomJS = React.memo((props) => React.createElement("svg", {
  fill: "currentcolor",
  viewBox: "0 0 24 24",
  children: React.createElement("path", {
    d: "M9 12l-4.463 4.969-4.537-4.969h3c0-4.97 4.03-9 9-9 2.395 0 4.565.942 6.179 2.468l-2.004 2.231c-1.081-1.05-2.553-1.699-4.175-1.699-3.309 0-6 2.691-6 6h3zm10.463-4.969l-4.463 4.969h3c0 3.309-2.691 6-6 6-1.623 0-3.094-.65-4.175-1.699l-2.004 2.231c1.613 1.526 3.784 2.468 6.179 2.468 4.97 0 9-4.03 9-9h3l-4.537-4.969z"
  }),
  ...props
}))

module.exports = { Plugins, Themes, CustomCSS, Updater }
