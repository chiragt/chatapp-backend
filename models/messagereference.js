'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MessageReference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  MessageReference.init({
    message_id: DataTypes.INTEGER,
    MessageId: DataTypes.INTEGER,
    from_id: DataTypes.INTEGER,
    to_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MessageReference',
  });
  return MessageReference;
};