import pathlib,json,hashlib,concurrent.futures
from PIL import Image,ImageOps
import argparse
parser=argparse.ArgumentParser(description='Prepare the 30 supplied generated compositions. Does not generate new images.')
parser.add_argument('--input',type=pathlib.Path,required=True)
parser.add_argument('--root',type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[1])
args=parser.parse_args()
ROOT=args.root; IN=args.input
# Files are the thirty actual outputs in the preceding three rounds, not filenames inferred from IDs.
rows=[
(1,'gul-lokumu','güllü_lokum_ve_türk_çayı_sofrası.png','lokum',['DT002'],['DT002'],'56fd47e4-5e1a-4d9f-85d9-eb6b06ee979c'),
(1,'kiraz-visne-lokumu','vişneli_lokumun_rustik_lezzeti.png','lokum',['DT001'],[],'ccccece3-dd7d-4a64-9a81-332e2e7d7755'),
(1,'elma-sirkesi','rustik_elma_sirkesi_natürmortu.png','pantry',['DT117'],['DT117'],'0cf6f789-81e9-40f2-b6d8-2123e01f96b0'),
(1,'uzum-pekmezi','rustik_pekmez_ve_üzümler.png','pantry',['DT101'],['DT101'],'76b541ff-a180-4cc3-ab2d-b2e86500139c'),
(1,'tarhana','rustik_tarhana_kasesi_ve_anadolu_lezzetleri.png','pantry',['DT157'],['DT157'],'02c65078-10d7-4c2a-8e4b-9fcc652afdcc'),
(1,'hurma-kompozisyonu','rustik_bakır_kasede_parlak_hurma_ziyafeti.png','dates',[],[],'b0eeb270-e8f5-4913-af46-a2512c998b25'),
(1,'yesil-elma-lif-sabunu','rustik_elma_ve_lifli_sabunlar.png','soap',['DT018'],['DT018'],'e1c9e291-cb59-4576-8865-a1edc5dafb02'),
(1,'corekotu-yagi','rustik_çörek_otu_yağı_kompozisyonu.png','oil',['DT182'],['DT182'],'408006ce-fa4e-4f5f-ad14-08e9392fd6a9'),
(1,'sari-kayisi','rustik_kasede_kuru_kayısılar.png','nuts',['DT131'],['DT131'],'bd5cc048-fcc5-45b2-b7ea-0fafc557333d'),
(1,'kestane-bali','kestane_balı_ve_rustik_hasat.png','honey',['DT097'],['DT097'],'4fbccf23-749a-416b-8538-d687d99a53b8'),
(2,'nar-lokumu','nar_ekşili_lokum_ve_rustik_sofra.png','lokum',['DT006'],['DT006'],'4e92542c-c829-4436-a12b-bde381d99566'),
(2,'antep-fistikli-lokum','anadolu_esintili_antep_fıstıklı_lokum.png','lokum',['DT010'],['DT010'],'5dba09a1-d32a-47cd-88d0-a4875f6a9a37'),
(2,'lavanta-lif-sabunu-yuvarlak','el_yapımı_lavantalı_lif_sabunları.png','soap',['DT021'],['DT021'],'9c4859b4-28b0-4aef-8c04-e2f18c1856c3'),
(2,'cam-bali-kompozisyonu','rustik_çam_kozalakları_arasında_bal_kavanozu.png','honey',['DT096'],[],'fa249311-e045-4737-b324-a21e9860afe1'),
(2,'keciboynuzu-pekmezi-kompozisyonu','keçiboynuzu_pekmezi_rustik_sofrası.png','pantry',[],[],'350475a0-0181-4ad3-adc4-d44980c94cee'),
(2,'susam-yagi','rustik_susam_yağı_natürmortu.png','oil',['DT186'],['DT186'],'43d5fdff-b839-41e1-9905-6d75ff864566'),
(2,'tam-bugday-unu','rustik_mutfakta_buğday_unu_düzeni.png','flour',['DT170'],['DT170'],'64339bf1-cfab-44ae-b851-d43427154d51'),
(2,'pembe-tuz-kompozisyonu','rustik_pembe_kaya_tuzu_natürmortu.png','salt',[],[],'ecf9243c-7c98-4a26-bd6b-850fdb52459d'),
(2,'kuru-incir','rustik_i_ncirlerle_sıcak_mutfak_натürmortu.png','nuts',['DT128','DT129'],['DT128','DT129'],'73b75db4-48de-4fa1-bdde-4e933f945ab7'),
(2,'ceviz','rustik_ahşap_masada_cevizler.png','nuts',['DT132'],['DT132'],'1bcb6389-09b1-43c2-8a93-d3fdf6197978'),
(3,'bergamotlu-cay','bergamotlu_çayın_sıcak_hikâyesi.png','spice',['DT235'],['DT235'],'e0dc2745-4b55-4a5d-b508-52df9060943e'),
(3,'gul-temali-bakim','rustik_gül_suyu_şişesi.png','care',[],[],'1ab88537-c326-444c-b98b-566358e0521c'),
(3,'kiraz-lokumu-cay','kirazlı_lokum_ve_türk_çayı_sofrası.png','lokum',['DT001'],['DT001'],'63984d9c-c846-4d1c-9ac4-b5901da5e881'),
(3,'lavanta-lif-sabunu-kare','rustik_lavanta_lif_sabunları.png','soap',['DT021'],[],'e0a0b3d3-c187-47b9-9600-7541628f5057'),
(3,'cam-puren-bali','rustik_bal_kavanozu_ve_çam_esintileri.png','honey',['DT096'],['DT096'],'9f2ccda6-738b-43a6-a3ef-9d9cf720612b'),
(3,'kuru-incir-kase','rustik_ortamda_kuru_i_ncirler.png','nuts',['DT128','DT129'],[],'819e714c-e10c-47e4-9c39-fdef34763ae5'),
(3,'ceviz-kase','rustik_ahşapta_ceviz_ziyafeti.png','nuts',['DT132'],[],'82e7e44a-7127-486f-bc8a-a96529685cd8'),
(3,'bugday-unu-cuval','rustik_mutfakta_un_çuvalı.png','flour',['DT169'],['DT169'],'4175e399-fe73-487f-8070-5e89f2ac59f9'),
(3,'hediye-seckisi','rustik_gurmе_hediye_sepeti.png','gift',[],[],'a5353139-7b17-44c1-bfb2-d59d40cc1e4a'),
(3,'baharat-bitki-seckisi','rustik_baharatlar_ve_otlar_sofrası.png','spice',[],[],'ba1581e2-53d0-4580-873f-868d696a3924'),
]
notes={
'R1-06':'Generic dark dates. Cultivar not established by the generated image. Not attached to Acve SKU.',
'R1-09':'Original prompt named gunkurusu, but the image shows orange dried apricots. Illustrative match to sari kayisi DT131, never gunkurusu DT130.',
'R2-05':'Generic unbranded carob molasses composition. Not presented as the packaging of BIOAROMAFARM or CRETA CAROB.',
'R2-08':'Pink salt concept. Source catalogue does not establish pink salt. Gallery only, no product match.',
'R3-02':'Pink liquid is not a verified depiction of rose distillate. Rose-themed care concept only, not DT049.',
'R3-09':'Gift inspiration only. Not a purchasable bundle, packing instruction, or promise of exact contents.',
'R3-04':'Alternative soap shape is a separate illustrative concept, not a second view of the same physical bar.',
}
# Compute before transforming, and protect originals.
assert len(rows)==30
records=[]
for i,(batch,slug,name,category,ids,primary,gid) in enumerate(rows):
 p=IN/name; assert p.is_file(),p
 sha=hashlib.sha256(p.read_bytes()).hexdigest(); id=f'R{batch}-{i%10+1:02}'
 with Image.open(p) as im: width,height=im.size
 assert width==1448 and height==1086,(p,width,height)
 records.append(dict(id=id,round=batch,slug=slug,originalName=name,originalSha256=sha,generationId=gid,kind='illustration',verifiedProductPhoto=False,usage='product' if ids else 'editorial',category=category,sourceIds=ids,primaryFor=primary,width=width,height=height,note=notes.get(id,'Generated illustrative composition. Does not establish packaging, recipe, provenance, quantity or SKU identity.'),variants=[]))
assert len(set(r['originalSha256'] for r in records))==30
OUT=ROOT/'public/media/generated';OUT.mkdir(parents=True,exist_ok=True)
def build(r):
 with Image.open(IN/r['originalName']) as source:
  img=ImageOps.exif_transpose(source).convert('RGB')
  for w in [400,800,1200,1448]:
   h=round(w*img.height/img.width); target=img if w==img.width else img.resize((w,h),Image.Resampling.LANCZOS)
   name=f"{r['id'].lower()}-{r['slug']}-{r['originalSha256'][:10]}-{w}.webp"
   p=OUT/name;target.save(p,'WEBP',quality=85 if w<=800 else 88,method=6)
   body=p.read_bytes();r['variants'].append(dict(src=f'/media/generated/{name}',width=w,height=h,bytes=len(body),sha256=hashlib.sha256(body).hexdigest()))
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: records=list(pool.map(build,records))
data=dict(version='3.1.0',generated=True,note='Thirty unique AI-generated compositions supplied in three conversation rounds. Never real shop photography. All are visible in the composition gallery; only explicit sourceIds may use them as illustrative product media.',scenes=records)
(ROOT/'src/data/generated-scenes.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('sources',len(records),'variants',sum(len(r['variants']) for r in records),'bytes',sum(v['bytes'] for r in records for v in r['variants']))
