import { getModelForClass, prop } from "@typegoose/typegoose";

export class user {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ default: "user" })
  public role!: string;
}

const User = getModelForClass(user);

export default User;
