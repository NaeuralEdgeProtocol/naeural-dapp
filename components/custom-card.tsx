import React from "react";

export const CustomCard = ({
  icon,
  title,
  value,
  subvalue,
  ctaEnabled,
  ctaText,
  ctaLink,
}) => {
  return (
    <div
      className="flex flex-col overflow-hidden h-auto text-gray-900 dark:text-gray-100 bg-white dark:bg-default/40 box-border outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-gray-500 dark:data-[focus-visible=true]:outline-gray-300 data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none overflow-none relative w-[420px] border-small border-gray-300 dark:border-gray-600 bg-left-top"
      tabIndex="-1"
    >
      <div className="flex p-3 z-10 w-full justify-between items-center shrink-0 overflow-inherit subpixel-antialiased rounded-t-large">
        <div className="flex items-center gap-3">
          <span
            className="flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-gray-500 dark:data-[focus-visible=true]:outline-gray-300 data-[focus-visible=true]:outline-offset-2 w-10 h-10 text-tiny rounded-full border-small border-gray-200 dark:border-gray-700 bg-transparent"
            tabIndex="-1"
          >
            <span
              aria-label="avatar"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full h-full"
              role="img"
            >
              {icon}
            </span>
          </span>
          <p className="text-small font-medium">{title}</p>
        </div>
        <div>
          <p className="text-large font-medium text-right">{value}</p>
          {subvalue != null && (
            <p className="text-xs font-light text-right">{subvalue}$</p>
          )}
        </div>
      </div>

      {ctaEnabled && (
        <div className="p-3 h-auto flex w-full items-center overflow-hidden subpixel-antialiased rounded-b-large justify-end gap-2">
          <a
            className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-gray-500 dark:data-[focus-visible=true]:outline-gray-300 data-[focus-visible=true]:outline-offset-2 px-4 min-w-20 h-10 text-small gap-2 rounded-medium w-full transition-transform-colors-opacity motion-reduce:transition-none data-[hover=true]:opacity-hover border-small border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            href={ctaLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ctaText}
          </a>
        </div>
      )}
    </div>
  );
};
