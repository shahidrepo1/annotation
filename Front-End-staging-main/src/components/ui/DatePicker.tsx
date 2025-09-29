import Datepicker, { type DatepickerType } from "react-tailwindcss-datepicker";

const DateRangePicker = (props: DatepickerType) => {
  const { placeholder = "Select Date Range" } = props;

  return (
    <Datepicker
      inputClassName={`w-full h-[38px] rounded-md focus:ring-0 placeholder:text-gray-700 placeholder:dark:text-dark-text dark:bg-dark-bg h-8 border-gray-400  border focus:border-black focus:outline-none px-2 dark:text-dark-text dark:bg-dark-bg`}
      toggleClassName="absolute rounded-r-lg text-gray-600 right-0 h-full px-3 dark:text-dark-text focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
      placeholder={placeholder}
      {...props}
    />
  );
};

export default DateRangePicker;
