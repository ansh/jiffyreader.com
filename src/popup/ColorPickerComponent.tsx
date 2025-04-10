import React, { useState } from 'react';

interface ColorPickerComponentProps {
	initialColors: string[];
	onChange: (colors: string[]) => void;
	disabled: boolean;
}

const ColorPickerComponent: React.FC<ColorPickerComponentProps> = ({ initialColors, onChange, disabled }) => {
	const [colors, setColors] = useState(initialColors);

	const handleColorChange = (color: string, index: number) => {
		const newColors = [...colors];
		newColors[index] = color;
		setColors(newColors);
		onChange(newColors);
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
			{colors.map((color, index) => (
				<div key={index} style={{ width: '24%', margin: '0.5rem' }}>
					<h3 style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Color {index + 1}</h3>
					<input
						type="color"
						value={color}
						disabled={disabled}
						onChange={(e) => handleColorChange(e.target.value, index)}
						style={{ width: '100%', height: '30px', cursor: 'pointer' }}
					/>
				</div>
			))}
		</div>
	);
};

export default ColorPickerComponent;
