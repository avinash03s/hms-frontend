const arrayToCSV = (arr: string[]) => {
    if(!arr || arr.length === 0) return "";
  return arr.join(", ");
}

export { arrayToCSV };