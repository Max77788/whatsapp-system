import clsx from "clsx";

export const buttonSmallStyle = (color="green", ...extraClasses) =>
    clsx(`mt-4 mb-2 px-3 py-1 text-white rounded-full transition mx-auto bg-${color}-600 hover:bg-${color}-700`, ...extraClasses);

export const buttonOrangeSmallStyle =
    "mt-4 px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition mx-auto";

export const buttonPurpleSmallStyle =
    "mt-4 px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition mx-auto";

export const buttonBlueSmallStyle =
    "mt-4 px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition mx-auto";

export const buttonBigStyle =
    "mt-4 px-5 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition mx-auto";
