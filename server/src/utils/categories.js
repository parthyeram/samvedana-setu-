export const imageTaxonomy = {
  Education: ['School Infrastructure', 'Digital Classrooms', 'Smart Education', 'Laboratories & Equipment', 'Learning Resources', 'Teacher Support', 'Student Accessibility', 'Digital Literacy', 'School Connectivity'],
  Healthcare: ['Healthcare Facilities', 'Medical Infrastructure', 'Medicine Availability', 'Healthcare Accessibility', 'Rural Healthcare', 'Emergency Services', 'Health Awareness', 'Medical Equipment', 'Telemedicine'],
  Agriculture: ['Crop Problems', 'Crop Disease / Damage', 'Irrigation', 'Soil Problems', 'Pest Management', 'Agricultural Technology', 'Farm Equipment', 'Crop Storage', 'Market Access', 'Farmer Support'],
  'Water Management': ['Water Leakage', 'Water Shortage', 'Drinking Water', 'Water Quality', 'Contaminated Water', 'Irrigation Water', 'Water Supply', 'Rainwater Harvesting', 'Water Conservation', 'Flooding / Waterlogging'],
  Sanitation: ['Garbage Collection', 'Waste Disposal', 'Drainage', 'Sewage', 'Public Toilets', 'Open Dumping', 'Wastewater', 'Sanitation Facilities', 'Cleanliness'],
  Environment: ['Air Pollution', 'Water Pollution', 'Plastic Waste', 'Solid Waste', 'Deforestation', 'Environmental Damage', 'Noise Pollution', 'Waste Management', 'Green Spaces', 'Conservation'],
  'Energy & Electricity': ['Electricity Supply', 'Power Infrastructure', 'Broken Streetlights', 'Electricity Access', 'Solar Energy', 'Renewable Energy', 'Energy Efficiency', 'Community Solar', 'Power Safety'],
  'Roads & Transportation': ['Potholes', 'Road Damage', 'Broken Roads', 'Road Safety', 'Traffic Problems', 'Public Transport', 'Bus Stops', 'Road Signs', 'Footpaths', 'Bridges'],
  'Urban Infrastructure': ['Public Infrastructure', 'Footpaths', 'Public Buildings', 'Parks', 'Street Infrastructure', 'Drainage', 'Public Toilets', 'Parking', 'Community Facilities', 'Urban Services'],
  Accessibility: ['Wheelchair Accessibility', 'Missing Ramps', 'Accessible Buildings', 'Accessible Toilets', 'Accessible Transport', 'Blocked Accessible Paths', 'Visual Accessibility', 'Hearing Accessibility', 'Assistive Technology']
};

export const textTaxonomy = {
  Education: ['Teacher Support', 'Digital Literacy', 'School Connectivity', 'Learning Resources', 'Teacher/Staff Shortage', 'Digital Learning Gap', 'Dropout/Enrollment Issue'],
  Healthcare: ['Healthcare Accessibility', 'Rural Healthcare', 'Emergency Services', 'Health Awareness', 'Telemedicine', 'Ambulance/Emergency Delay', 'Maternal & Child Health Access', 'Disease Outbreak/Sanitation-linked Illness'],
  Agriculture: ['Farmer Support', 'Market Access', 'Irrigation', 'Soil Problems', 'Pest Management', 'Crop Problems', 'Market Access/MSP Issue'],
  'Water Management': ['Water Shortage', 'Drinking Water', 'Water Quality', 'Contaminated Water', 'Water Supply', 'Rainwater Harvesting', 'Water Conservation', 'Flooding / Waterlogging'],
  Sanitation: ['Garbage Collection', 'Waste Disposal', 'Drainage', 'Sewage', 'Public Toilets', 'Open Dumping', 'Wastewater', 'Sanitation Facilities', 'Cleanliness'],
  Environment: ['Air Pollution', 'Water Pollution', 'Plastic Waste', 'Solid Waste', 'Environmental Damage', 'Noise Pollution', 'Waste Management', 'Green Spaces', 'Conservation'],
  'Energy & Electricity': ['Electricity Supply', 'Power Infrastructure', 'Electricity Access', 'Solar Energy', 'Renewable Energy', 'Energy Efficiency', 'Community Solar', 'Power Safety', 'Power Outage/Load-shedding', 'Renewable Energy Access Gap'],
  'Roads & Transportation': ['Road Safety', 'Traffic Problems', 'Public Transport', 'Bus Stops', 'Road Signs', 'Footpaths', 'Bridges', 'Public Transport Gap'],
  'Urban Infrastructure': ['Public Infrastructure', 'Footpaths', 'Public Buildings', 'Parks', 'Street Infrastructure', 'Drainage', 'Public Toilets', 'Parking', 'Community Facilities', 'Urban Services'],
  Accessibility: ['Wheelchair Accessibility', 'Missing Ramps', 'Accessible Buildings', 'Accessible Toilets', 'Accessible Transport', 'Blocked Accessible Paths', 'Visual Accessibility', 'Hearing Accessibility', 'Assistive Technology', 'No Signage for Visually Impaired', 'Inaccessible Public Transport'],
  'Public Administration': ['Delayed Govt Scheme Benefit', 'Grievance Redressal/Corruption', 'Document/Certificate Delay', 'Panchayat/ULB Responsiveness']
};
export const taxonomy = Object.keys({ ...imageTaxonomy, ...textTaxonomy }).reduce((all, category) => { all[category] = [...new Set([...(imageTaxonomy[category] || []), ...(textTaxonomy[category] || [])])]; return all; }, {});
export const getTaxonomy = inputType => inputType === 'image' ? imageTaxonomy : textTaxonomy;
export const getCategoryNames = () => Object.keys(taxonomy);
export const getCategory = name => taxonomy[name];
export const isValidCategory = name => Object.prototype.hasOwnProperty.call(taxonomy, name);
export const isValidSubcategory = (category, subcategory) => isValidCategory(category) && taxonomy[category].includes(subcategory);
