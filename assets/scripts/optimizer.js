function burdenSharing() {
  // Assuming you have access to the `sholtim-container` element and `sholetObject` array

  // Get all the lists in the `sholtim-container` element
  const lists = Array.from($("#sholtim-container ul"));

  // Create an array to store the ratios
  const ratios = [];

  // Iterate over each list
  lists.forEach((list, index) => {
    // Get the corresponding `maxShift` from the `sholetObject` array
    const maxShifts = sholtimObjectArray[index].maxShifts;

    // Count the number of items in the list
    const itemCount = list.children.length;

    // Calculate the ratio
    const ratio = itemCount / maxShifts;

    // Store the ratio in the array
    ratios.push(ratio);
  });

  // Find the minimum and maximum ratios
  const minRatio = Math.min(...ratios);
  const maxRatio = Math.max(...ratios);

  // Print the minimum and maximum ratios
  console.log("Minimum Ratio:", minRatio);
  console.log("Maximum Ratio:", maxRatio);
}
