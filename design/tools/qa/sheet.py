import sys,glob,re,os
from PIL import Image,ImageDraw
SP=sys.argv[1]
for pref in sys.argv[2:]:
  fs=sorted(glob.glob(f'{SP}/sheets/{pref}_*.png'),key=lambda f:[int(x) if x.isdigit() else x for x in re.split(r'(\d+)',f)])
  if not fs:continue
  W=440;ims=[]
  for f in fs:
    im=Image.open(f).convert('RGB');h=int(im.height*W/im.width);ims.append((os.path.basename(f)[len(pref)+1:-4],im.resize((W,h))))
  cols=3;rows=(len(ims)+cols-1)//cols;H=max(i.height for _,i in ims)
  S=Image.new('RGB',(cols*W,rows*(H+16)),'white');d=ImageDraw.Draw(S)
  for k,(n,im) in enumerate(ims):x=(k%cols)*W;y=(k//cols)*(H+16);S.paste(im,(x,y+16));d.text((x+4,y+2),n,fill='black')
  S.save(f'{SP}/sheet_{pref}.jpg',quality=80)
