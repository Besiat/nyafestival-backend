import { NominationPublicField } from "../interfaces/nomination-public-field";

export const NOMINATION_PUBLIC_FIELDS_FOR_VOTING: NominationPublicField[] = [
    {
      code: 'photo',
      fields: ['char_name', 'fandom', 'nick_photographer', 'nick_model', 'char_pic', 'photocosplay_1', 'photocosplay_2', 'photocosplay_3'],
    },
    {
      code: 'pet',
      fields: ['char_name', 'fandom', 'pet_name', 'pet_age', 'char_pic', 'photocosplay_1', 'photocosplay_2', 'photocosplay_3'],    
    },
    {
      code: 'edit',
      fields: ['fandom', 'nickname', 'video_name', 'video_link'],    
    },
  ];