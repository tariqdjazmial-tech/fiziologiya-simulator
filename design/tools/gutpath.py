"""Средна линия на червата (HRA) за пътищата на съдържимото в ГИТ сцената.
   Вход: JSON с мрежите в координатите на сцената (извлечени от страницата: A.o.col/jej/ile/duo).
   python3 design/tools/gutpath.py gut.json col 0.35 60 out.json 01   (оси за запълване по срези: 0=x,1=y,2=z)"""
import json,sys,numpy as np,trimesh,networkx as nx
from scipy import ndimage
from skimage.morphology import skeletonize
d=json.load(open(sys.argv[1]));key=sys.argv[2].split('+');vox=float(sys.argv[3])
meshes=[]
for k in key:
  for m in d[k]:
    P=np.array(m['P']).reshape(-1,3);I=np.array(m['I']).reshape(-1,3);meshes.append(trimesh.Trimesh(P,I,process=True))
M=trimesh.util.concatenate(meshes)
lo=M.bounds[0]-2*vox;hi=M.bounds[1]+2*vox;shape=np.ceil((hi-lo)/vox).astype(int)+1
# surface voxels from dense surface sampling, then fill
pts,_=trimesh.sample.sample_surface_even(M,400000) if False else trimesh.sample.sample_surface(M,600000)
idx=np.floor((pts-lo)/vox).astype(int);V=np.zeros(shape,bool);V[idx[:,0],idx[:,1],idx[:,2]]=True
V=ndimage.binary_closing(V,iterations=1)
F=ndimage.binary_fill_holes(V)
for ax in [int(c) for c in sys.argv[6]]:
  Fa=np.moveaxis(V,ax,0).copy()
  for i in range(Fa.shape[0]):Fa[i]=ndimage.binary_fill_holes(Fa[i])
  F|=np.moveaxis(Fa,0,ax)
F=ndimage.binary_opening(F,iterations=1)
print('vox',shape,V.sum(),F.sum(),file=sys.stderr)
S=skeletonize(F)
pts=np.argwhere(S)
G=nx.Graph();ix={tuple(p):i for i,p in enumerate(pts)}
for i,p in enumerate(pts):
  for dx in (-1,0,1):
    for dy in (-1,0,1):
      for dz in (-1,0,1):
        q=(p[0]+dx,p[1]+dy,p[2]+dz)
        if q in ix and ix[q]>i:G.add_edge(i,ix[q],weight=np.sqrt(dx*dx+dy*dy+dz*dz))
comp=max(nx.connected_components(G),key=len);H=G.subgraph(comp)
# longest shortest path (double sweep)
a=next(iter(comp));L=nx.single_source_dijkstra_path_length(H,a);b=max(L,key=L.get);L,Pth=nx.single_source_dijkstra(H,b);c=max(L,key=L.get);path=Pth[c]
xyz=lo+pts[path]*vox
print('skeleton pts',len(pts),'components',nx.number_connected_components(G),'path len',L[c]*vox,file=sys.stderr)
# smooth & resample
from scipy.ndimage import gaussian_filter1d
xyz=gaussian_filter1d(xyz,3,axis=0,mode='nearest')
seg=np.r_[0,np.cumsum(np.linalg.norm(np.diff(xyz,axis=0),axis=1))]
n=int(sys.argv[4]);t=np.linspace(0,seg[-1],n);out=np.stack([np.interp(t,seg,xyz[:,k]) for k in range(3)],1)
json.dump(out.round(2).tolist(),open(sys.argv[5],'w'))
print(out[0],out[-1],file=sys.stderr)
