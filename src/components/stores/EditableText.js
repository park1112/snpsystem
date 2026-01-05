import PropTypes from 'prop-types';

// components/EditableText.js

const EditableText = ({ template, onChange }) => {
  // 템플릿에서 {placeholder} 부분을 찾아 분리
  const parts = template.split(/(\{[^}]+\})/g);

  return (
    <div style={styles.container}>
      {parts.map((part, index) => {
        const match = part.match(/\{([^}]+)\}/);
        if (match) {
          const key = match[1];
          return (
            <input
              key={index}
              type="text"
              placeholder={key}
              onChange={(e) => onChange(key, e.target.value)}
              style={styles.input}
            />
          );
        } else {
          return (
            <span key={index} style={styles.text}>
              {part}
            </span>
          );
        }
      })}
    </div>
  );
};

EditableText.propTypes = {
  template: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '8px',
    margin: '0 5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  text: {
    margin: '0 5px',
  },
};

export default EditableText;
