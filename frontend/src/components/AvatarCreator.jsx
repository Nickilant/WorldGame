const swatches = ['#f1c27d', '#c68642', '#8d5524', '#ff5f6d', '#4d9eff', '#2ecc71', '#2d1c13'];

export default function AvatarCreator({ avatar, onChange }) {
  return (
    <div className="panel">
      <h3>Avatar Creator</h3>
      {['skin', 'hair', 'shirt', 'pants'].map((part) => (
        <div key={part} className="row">
          <span>{part}</span>
          <div className="swatches">
            {swatches.map((color) => (
              <button
                key={`${part}-${color}`}
                style={{ background: color }}
                className={avatar[part] === color ? 'active' : ''}
                onClick={() => onChange({ ...avatar, [part]: color })}
              />
            ))}
          </div>
        </div>
      ))}
      <p className="hint">Blocky avatar colors sync locally for MVP.</p>
    </div>
  );
}
