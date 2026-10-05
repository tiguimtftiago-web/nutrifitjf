import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
 return {name:"Nutrifit",short_name:"Nutrifit",description:"Pedidos e refeições Nutrifit.",start_url:"/nutrifit",display:"standalone",background_color:"#080a07",theme_color:"#080a07",orientation:"portrait",lang:"pt-BR"};
}
