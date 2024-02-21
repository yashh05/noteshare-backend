import {
  Ref,
  getModelForClass,
  modelOptions,
  prop,
} from "@typegoose/typegoose";
import { user } from "./user.model";

@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
})
export class docSchema {
  @prop({ required: true })
  public name!: string;

  @prop()
  public desc?: string;

  @prop({ ref: () => user, required: true })
  public adminId!: Ref<user>;

  @prop({ ref: () => user })
  public readonly?: Ref<user>[];

  @prop({ ref: () => user })
  public readWrite?: Ref<user>[];

  @prop()
  public docData?: Object;
}
const Doc = getModelForClass(docSchema);

export default Doc;
