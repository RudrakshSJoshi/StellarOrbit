; ModuleID = 'autocfg_3dfb0d2bf3338edd_3.fa6437122a076751-cgu.0'
source_filename = "autocfg_3dfb0d2bf3338edd_3.fa6437122a076751-cgu.0"
target datalayout = "e-m:e-p:32:32-p10:8:8-p20:8:8-i64:64-n32:64-S128-ni:1:10:20"
target triple = "wasm32-unknown-unknown"

; autocfg_3dfb0d2bf3338edd_3::probe
; Function Attrs: nounwind
define dso_local void @_ZN26autocfg_3dfb0d2bf3338edd_35probe17hd2e69fb625ae6812E() unnamed_addr #0 {
start:
  %0 = alloca [4 x i8], align 4
  store i32 1, ptr %0, align 4
  %_0.i = load i32, ptr %0, align 4
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind speculatable willreturn memory(none)
declare i32 @llvm.cttz.i32(i32, i1 immarg) #1

attributes #0 = { nounwind "target-cpu"="generic" }
attributes #1 = { nocallback nofree nosync nounwind speculatable willreturn memory(none) }

!llvm.ident = !{!0}

!0 = !{!"rustc version 1.85.1 (4eb161250 2025-03-15)"}
