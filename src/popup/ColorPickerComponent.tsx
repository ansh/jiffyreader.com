import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

interface ColorPickerComponentProps {
  initialColors: string[];
  onChange: (colors: string[]) => void;
}

const ColorPickerComponent: React.FC<ColorPickerComponentProps> = ({ initialColors, onChange }) => {
  const [colors, setColors] = useState(initialColors);
  const [activePicker, setActivePicker] = useState<number | null>(null);

  const handleColorChange = (color: any, index: number) => {
    const newColors = [...colors];
    newColors[index] = color.hex;
    setColors(newColors);
    onChange(newColors);
  };

  const togglePicker = (index: number) => {
    setActivePicker(activePicker === index ? null : index);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      {colors.map((color, index) => (
        <div key={index} style={{ width: '24%', margin: '0.5rem', position: 'relative' }}>
          <h3 style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Color {index + 1}</h3>
          <div
            style={{
              backgroundColor: color,
              width: '100%',
              height: '20px',
              cursor: 'pointer',
              marginBottom: '0.2rem',
            }}
            onClick={() => togglePicker(index)}
          />
          {activePicker === index && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 1,
                width: '100%',
              }}
            >
              <ChromePicker
                color={color}
                onChange={(c) => handleColorChange(c, index)}
                width="180px"
                disableAlpha={true}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ColorPickerComponent;