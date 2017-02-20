/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('resume', {
    Id: {
      field: 'id',
      type: DataTypes.INTEGER(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
		Name: {
      field: 'name',
      type: DataTypes.STRING(255),
      allowNull: false,
    },
		Email: {
      field: 'email',
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // PhoneNumber
	    Number: {
      field: 'number',
      type: DataTypes.STRING(255),
      allowNull: false,
    },
	    Notes: {
      field: 'notes',
      type: DataTypes.STRING(10000),
      allowNull: false,
    },
      // Resume Picture
	    Resume: {
      field: 'resume',
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
    // Profile Picture
		Profile: {
      field: 'picture',
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
	ResumeOverlay: {
      field: 'ResumeOverlay',
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
		Rating: {
      field: 'rating',
      type: DataTypes.INTEGER(4),
      allowNull: false,
    },
  }, {
    tableName: 'resume',
    timestamps: false
  });
};
